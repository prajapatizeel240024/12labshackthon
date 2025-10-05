import {modelDetails, OpenAIModel} from "../models/model";
import {ChatCompletion, ChatCompletionMessage, ChatCompletionRequest, ChatMessage, ChatMessagePart, Role, MessageType} from "../models/ChatCompletion";
import {OPENAI_API_KEY} from "../config";
import {CustomError} from "./CustomError";
import {CHAT_COMPLETIONS_ENDPOINT, MODELS_ENDPOINT} from "../constants/apiEndpoints";
import {ChatSettings} from "../models/ChatSettings";
import {CHAT_STREAM_DEBOUNCE_TIME, DEFAULT_MODEL} from "../constants/appConstants";
import {NotificationService} from '../service/NotificationService';
import { FileData, FileDataRef } from "../models/FileData";
import VideoSearchService from './VideoSearchService';
import { VIDEO_SEARCH_USER_PROMPT_TEMPLATE, getVideoSearchInstructions } from '../utils/VideoSearchPrompts';

interface CompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionChunkChoice[];
}

interface CompletionChunkChoice {
  index: number;
  delta: {
    content: string;
  };
  finish_reason: null | string; // If there can be other values than 'null', use appropriate type instead of string.
}

export class ChatService {
  private static models: Promise<OpenAIModel[]> | null = null;
  static abortController: AbortController | null = null;

  /**
   * Enhance the last user message with video search results if applicable
   */
  static async enhanceMessagesWithVideoSearch(messages: ChatMessage[]): Promise<ChatMessage[]> {
    console.log('=== Video Search Enhancement Started ===');
    
    if (messages.length === 0) {
      console.log('No messages to enhance');
      return messages;
    }

    const lastMessage = messages[messages.length - 1];
    console.log('Last message:', lastMessage);
    
    if (lastMessage.role !== Role.User) {
      console.log('Last message is not from user, skipping');
      return messages;
    }

    // Check if video search is available
    const isVideoSearchAvailable = VideoSearchService.isVideoSearchAvailable();
    console.log('Video search available:', isVideoSearchAvailable);
    
    if (!isVideoSearchAvailable) {
      console.log('Video search not available, returning original messages');
      return messages;
    }

    // Check if the message might benefit from video search
    const shouldSearchVideos = this.shouldSearchVideos(lastMessage.content);
    console.log('Should search videos:', shouldSearchVideos);
    
    // Always search videos if available, regardless of keywords (for now)
    // TODO: Make this smarter later
    if (!shouldSearchVideos) {
      console.log('Message does not trigger video search, but trying anyway for testing');
      // Don't return early - let's try video search anyway
    }

    try {
      console.log('Performing video search for:', lastMessage.content);
      
      // Perform video search
      const videoResults = await VideoSearchService.searchVideos(lastMessage.content);
      console.log('Video search results:', videoResults);
      
      if (videoResults.success && videoResults.results.length > 0) {
        console.log(`Found ${videoResults.results.length} video results`);
        
        // Format video results
        const formattedResults = VideoSearchService.formatSearchResults(videoResults.results);
        console.log('Formatted results:', formattedResults);
        
        // Create enhanced message with video context
        const enhancedMessages = [...messages];
        enhancedMessages[enhancedMessages.length - 1] = {
          ...lastMessage,
          content: VIDEO_SEARCH_USER_PROMPT_TEMPLATE(lastMessage.content, formattedResults)
        };

        console.log('Enhanced message created:', enhancedMessages[enhancedMessages.length - 1]);
        return enhancedMessages;
      } else {
        console.log('No video results found or search failed');
      }
    } catch (error) {
      console.error('Video search failed:', error);
      // Continue with original messages if video search fails
    }

    console.log('Returning original messages');
    return messages;
  }

  /**
   * Determine if a user query should trigger video search
   */
  private static shouldSearchVideos(content: string): boolean {
    const lowerContent = content.toLowerCase();
    
    // Keywords that suggest the user might be asking about video content
    const videoKeywords = [
      'video', 'videos', 'show me', 'find', 'search', 'look for',
      'what is', 'how to', 'explain', 'tell me about', 'information about',
      'content', 'watch', 'see', 'demonstration', 'example', 'tutorial',
      'fashion', 'trends', 'uploaded', 'my videos', 'library', 'collection'
    ];

    // Check if the message contains video-related keywords or is asking for information
    const shouldSearch = videoKeywords.some(keyword => lowerContent.includes(keyword)) ||
                        content.length > 10; // Search for longer queries that might benefit from video context
    
    console.log('Video search trigger check:', {
      content: content,
      shouldSearch: shouldSearch,
      matchedKeywords: videoKeywords.filter(keyword => lowerContent.includes(keyword))
    });
    
    return shouldSearch;
  }

  /**
   * Get system prompt with video search instructions
   */
  static getSystemPromptWithVideoSearch(chatSettings: ChatSettings): string {
    const hasVideos = VideoSearchService.isVideoSearchAvailable();
    const videoInstructions = getVideoSearchInstructions(hasVideos);
    
    const baseInstructions = chatSettings.instructions || 'You are a helpful assistant.';
    return `${baseInstructions}\n\n${videoInstructions}`;
  }

  /**
   * Add system prompt if not already present in messages
   */
  private static addSystemPromptIfNeeded(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
    // Check if first message is already a system message
    if (messages.length > 0 && messages[0].role === Role.System) {
      return messages;
    }

    // Add system message at the beginning
    const systemMessage: ChatMessage = {
      role: Role.System,
      messageType: MessageType.Normal,
      content: systemPrompt,
      fileDataRef: []
    };

    return [systemMessage, ...messages];
  }


  static async mapChatMessagesToCompletionMessages(modelId: string, messages: ChatMessage[]): Promise<ChatCompletionMessage[]> {
    const model = await this.getModelById(modelId); // Retrieve the model details
    if (!model) {
      throw new Error(`Model with ID '${modelId}' not found`);
    }

    return messages.map((message) => {
      const contentParts: ChatMessagePart[] = [{
        type: 'text',
        text: message.content
      }];

      if (model.image_support && message.fileDataRef) {
        message.fileDataRef.forEach((fileRef) => {
          const fileUrl = fileRef.fileData!.data;
          if (fileUrl) {
            const fileType = (fileRef.fileData!.type.startsWith('image')) ? 'image_url' : fileRef.fileData!.type;
            contentParts.push({
              type: fileType,
              image_url: {
                url: fileUrl
              }
            });
          }
        });
      }
      return {
        role: message.role,
        content: contentParts,
      };
    });
  }


  static async sendMessage(messages: ChatMessage[], modelId: string): Promise<ChatCompletion> {
    let endpoint = CHAT_COMPLETIONS_ENDPOINT;
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    const mappedMessages = await ChatService.mapChatMessagesToCompletionMessages(modelId,messages);

    const requestBody: ChatCompletionRequest = {
      model: modelId,
      messages: mappedMessages,
    };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new CustomError(err.error.message, err);
    }

    return await response.json();
  }

  private static lastCallbackTime: number = 0;
  private static callDeferred: number | null = null;
  private static accumulatedContent: string = ""; // To accumulate content between debounced calls

  static debounceCallback(callback: (content: string, fileDataRef: FileDataRef[]) => void, delay: number = CHAT_STREAM_DEBOUNCE_TIME) {
    return (content: string) => {
      this.accumulatedContent += content; // Accumulate content on each call
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallbackTime;

      if (this.callDeferred !== null) {
        clearTimeout(this.callDeferred);
      }

      this.callDeferred = window.setTimeout(() => {
        callback(this.accumulatedContent,[]); // Pass the accumulated content to the original callback
        this.lastCallbackTime = Date.now();
        this.accumulatedContent = ""; // Reset the accumulated content after the callback is called
      }, delay - timeSinceLastCall < 0 ? 0 : delay - timeSinceLastCall);  // Ensure non-negative delay

      this.lastCallbackTime = timeSinceLastCall < delay ? this.lastCallbackTime : now; // Update last callback time if not within delay
    };
  }

  static async sendMessageStreamed(chatSettings: ChatSettings, messages: ChatMessage[], callback: (content: string,fileDataRef: FileDataRef[]) => void): Promise<any> {
    console.log('=== CHAT SERVICE STARTED ===');
    console.log('ChatSettings:', chatSettings);
    console.log('Messages:', messages);
    
    const debouncedCallback = this.debounceCallback(callback);
    this.abortController = new AbortController();
    let endpoint = CHAT_COMPLETIONS_ENDPOINT;
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    };

    console.log('About to enhance messages with video search...');
    
    // Enhance messages with video search results
    const enhancedMessages = await this.enhanceMessagesWithVideoSearch(messages);
    
    console.log('Enhanced messages:', enhancedMessages);
    
    // Add system prompt with video search instructions if not already present
    const systemPrompt = this.getSystemPromptWithVideoSearch(chatSettings);
    const messagesWithSystem = this.addSystemPromptIfNeeded(enhancedMessages, systemPrompt);

    const requestBody: ChatCompletionRequest = {
      model: DEFAULT_MODEL,
      messages: [],
      stream: true,
    };

    if (chatSettings) {
      const {model, temperature, top_p, seed} = chatSettings;
      requestBody.model = model ?? requestBody.model;
      requestBody.temperature = temperature ?? requestBody.temperature;
      requestBody.top_p = top_p ?? requestBody.top_p;
      requestBody.seed = seed ?? requestBody.seed;
    }

    const mappedMessages = await ChatService.mapChatMessagesToCompletionMessages(requestBody.model, messagesWithSystem);
    requestBody.messages = mappedMessages;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        NotificationService.handleUnexpectedError(error, 'Stream reading was aborted.');
      } else if (error instanceof Error) {
        NotificationService.handleUnexpectedError(error, 'Error reading streamed response.');
      } else {
        console.error('An unexpected error occurred');
      }
      return;
    }

    if (!response.ok) {
      const err = await response.json();
      throw new CustomError(err.error.message, err);
    }

    if (this.abortController.signal.aborted) {
      // todo: propagate to ui?
      console.log('Stream aborted');
      return; // Early return if the fetch was aborted
    }

    if (response.body) {
      // Read the response as a stream of data
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let partialDecodedChunk = undefined;
      try {
        while (true) {
          const streamChunk = await reader.read();
          const {done, value} = streamChunk;
          if (done) {
            break;
          }
          let DONE = false;
          let decodedChunk = decoder.decode(value);
          if (partialDecodedChunk) {
            decodedChunk = "data: " + partialDecodedChunk + decodedChunk;
            partialDecodedChunk = undefined;
          }
          const rawData = decodedChunk.split("data: ").filter(Boolean);  // Split on "data: " and remove any empty strings
          const chunks: CompletionChunk[] = rawData.map((chunk, index) => {
            partialDecodedChunk = undefined;
            chunk = chunk.trim();
            if (chunk.length == 0) {
              return;
            }
            if (chunk === '[DONE]') {
              DONE = true;
              return;
            }
            let o;
            try {
              o = JSON.parse(chunk);
            } catch (err) {
              if (index === rawData.length - 1) { // Check if this is the last element
                partialDecodedChunk = chunk;
              } else if (err instanceof Error) {
                console.error(err.message);
              }
            }
            return o;
          }).filter(Boolean); // Filter out undefined values which may be a result of the [DONE] term check

          let accumulatedContet = '';
          chunks.forEach(chunk => {
            chunk.choices.forEach(choice => {
              if (choice.delta && choice.delta.content) {  // Check if delta and content exist
                const content = choice.delta.content;
                try {
                  accumulatedContet += content;
                } catch (err) {
                  if (err instanceof Error) {
                    console.error(err.message);
                  }
                  console.log('error in client. continuing...')
                }
              } else if (choice?.finish_reason === 'stop') {
                // done
              }
            });
          });
          debouncedCallback(accumulatedContet);

          if (DONE) {
            return;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // User aborted the stream, so no need to propagate an error.
        } else if (error instanceof Error) {
          NotificationService.handleUnexpectedError(error, 'Error reading streamed response.');
        } else {
          console.error('An unexpected error occurred');
        }
        return;
      }
    }
  }

  static cancelStream = (): void => {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  static getModels = (): Promise<OpenAIModel[]> => {
    return ChatService.fetchModels();
  }

  static async getModelById(modelId: string): Promise<OpenAIModel | null> {
    try {
      const models = await ChatService.getModels();

      const foundModel = models.find(model => model.id === modelId);
      if (!foundModel) {
        throw new CustomError(`Model with ID '${modelId}' not found.`, {
          code: 'MODEL_NOT_FOUND',
          status: 404
        });
      }

      return foundModel;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to get models:', error.message);
        throw new CustomError('Error retrieving models.', {
          code: 'FETCH_MODELS_FAILED',
          status: (error as any).status || 500
        });
      } else {
        console.error('Unexpected error type:', error);
        throw new CustomError('Unknown error occurred.', {
          code: 'UNKNOWN_ERROR',
          status: 500
        });
      }
    }

  }


  static fetchModels = (): Promise<OpenAIModel[]> => {
    if (this.models !== null) {
      return Promise.resolve(this.models);
    }
    this.models = fetch(MODELS_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.error.message);
            });
          }
          return response.json();
        })
        .catch(err => {
          throw new Error(err.message || err);
        })
        .then(data => {
          const models: OpenAIModel[] = data.data;
          // Filter, enrich with contextWindow from the imported constant, and sort
          return models
              .filter(model => model.id.startsWith("gpt-"))
              .map(model => {
                const details = modelDetails[model.id] || {
                  contextWindowSize: 0,
                  knowledgeCutoffDate: '',
                  imageSupport: false,
                  preferred: false,
                  deprecated: false,
                };
                return {
                  ...model,
                  context_window: details.contextWindowSize,
                  knowledge_cutoff: details.knowledgeCutoffDate,
                  image_support: details.imageSupport,
                  preferred: details.preferred,
                  deprecated: details.deprecated,
                };
              })
              .sort((a, b) => b.id.localeCompare(a.id));
        });
    return this.models;
  };
}

