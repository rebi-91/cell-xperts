// import 'dotenv/config';
// import express from 'express';
// import cors from 'cors';
// import OpenAI from 'openai';

// const app = express();
// const PORT = process.env.PORT || 3001;

// /* -----------------------------
//    MIDDLEWARE
// --------------------------------*/

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: '50mb' }));

// /* -----------------------------
//    OPENAI CLIENT
// --------------------------------*/

// if (!process.env.OPENAI_API_KEY) {
//   console.error('❌ OPENAI_API_KEY is not set in environment variables');
//   process.exit(1);
// }

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// /* -----------------------------
//    TYPES
// --------------------------------*/

// interface VideoGenerationRequest {
//   prompt: string;
//   publicUrl?: string;
//   filename?: string;
//   model?: string;
//   seconds?: string;
//   size?: string;
// }

// interface MockVideoResponse {
//   id: string;
//   status: 'processing' | 'completed' | 'failed';
//   progress?: number;
//   output_url?: string;
//   error?: string;
//   estimated_completion_time?: string;
//   completed_at?: string;
// }

// /* -----------------------------
//    VIDEO GENERATION SERVICE
// --------------------------------*/

// class VideoGenerationService {
//   private mockVideos: Map<string, MockVideoResponse> = new Map();
//   private processingVideos: Set<string> = new Set();

//   /**
//    * Create a video generation job
//    */
//   async createVideo(request: VideoGenerationRequest): Promise<{ video_id: string; status: string }> {
//     const { prompt, publicUrl, model = 'sora-simulated', seconds = '8', size = '1280x720' } = request;

//     // Generate a unique ID
//     const videoId = `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Create mock video response
//     const mockVideo: MockVideoResponse = {
//       id: videoId,
//       status: 'processing',
//       progress: 0,
//       estimated_completion_time: new Date(Date.now() + 30000).toISOString(), // 30 seconds from now
//     };

//     // Store in memory
//     this.mockVideos.set(videoId, mockVideo);
//     this.processingVideos.add(videoId);

//     // Start simulated processing
//     this.simulateVideoProcessing(videoId, prompt, publicUrl);

//     return {
//       video_id: videoId,
//       status: 'processing',
//     };
//   }

//   /**
//    * Simulate video processing (for development)
//    */
//   private simulateVideoProcessing(videoId: string, prompt: string, publicUrl?: string): void {
//     let progress = 0;
    
//     const interval = setInterval(() => {
//       if (!this.mockVideos.has(videoId)) {
//         clearInterval(interval);
//         return;
//       }

//       progress += 10;
      
//       if (progress >= 100) {
//         // Video completed
//         const mockVideo = this.mockVideos.get(videoId);
//         if (mockVideo) {
//           mockVideo.status = 'completed';
//           mockVideo.progress = 100;
//           mockVideo.completed_at = new Date().toISOString();
          
//           // Generate a mock video URL (using sample videos)
//           const sampleVideos = [
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
//           ];
          
//           mockVideo.output_url = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
//           this.mockVideos.set(videoId, mockVideo);
//           this.processingVideos.delete(videoId);
//         }
//         clearInterval(interval);
//       } else {
//         // Update progress
//         const mockVideo = this.mockVideos.get(videoId);
//         if (mockVideo) {
//           mockVideo.progress = progress;
//           this.mockVideos.set(videoId, mockVideo);
//         }
//       }
//     }, 1000);
//   }

//   /**
//    * Get video status
//    */
//   async getVideoStatus(videoId: string): Promise<MockVideoResponse> {
//     // Check if it's a mock video
//     if (this.mockVideos.has(videoId)) {
//       const video = this.mockVideos.get(videoId);
//       if (video) {
//         return video;
//       }
//     }

//     // Try to check with OpenAI API (if using real Sora API)
//     try {
//       // Note: Sora API endpoint may vary. This is a placeholder.
//       // When Sora API becomes available, implement actual check here.
      
//       // For now, return a not found response
//       return {
//         id: videoId,
//         status: 'failed',
//         error: 'Video not found. Using mock service. Enable Sora API for real video generation.',
//       };
//     } catch (error: any) {
//       return {
//         id: videoId,
//         status: 'failed',
//         error: error.message || 'Failed to check video status',
//       };
//     }
//   }

//   /**
//    * Try to use OpenAI's actual video generation (when available)
//    */
//   private async tryOpenAIVideoGeneration(prompt: string, publicUrl?: string): Promise<string | null> {
//     try {
//       // This is a placeholder for when Sora API becomes available
//       // The actual implementation will depend on OpenAI's released API
//       console.log('Attempting to use OpenAI video generation (not yet available)');
//       return null;
//     } catch (error) {
//       console.error('OpenAI video generation not available:', error);
//       return null;
//     }
//   }
// }

// // Initialize service
// const videoService = new VideoGenerationService();

// /* -----------------------------
//    ROUTES
// --------------------------------*/

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Video Generation API',
//     mode: 'development (mock)',
//     note: 'Using mock video service. Set up Sora API for real video generation.'
//   });
// });

// /**
//  * POST /api/video/create
//  */
// app.post('/api/video/create', async (req, res) => {
//   try {
//     const {
//       prompt,
//       publicUrl,
//       filename = 'input',
//       model = 'sora-simulated',
//       seconds = '8',
//       size = '1280x720',
//     } = req.body;

//     console.log('Creating video with prompt:', prompt.substring(0, 100) + '...');

//     if (!prompt || prompt.trim().length === 0) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }

//     // Validate size
//     const validSizes = ['1920x1080', '1280x720', '1080x1920', '720x1280'];
//     if (!validSizes.includes(size)) {
//       return res.status(400).json({ error: `Invalid size. Must be one of: ${validSizes.join(', ')}` });
//     }

//     // Validate seconds
//     const secondsNum = parseInt(seconds, 10);
//     if (isNaN(secondsNum) || secondsNum < 1 || secondsNum > 60) {
//       return res.status(400).json({ error: 'Seconds must be between 1 and 60' });
//     }

//     // Log input reference if provided
//     if (publicUrl) {
//       console.log('Input reference URL provided:', publicUrl);
//     }

//     // Create video using our service
//     const result = await videoService.createVideo({
//       prompt,
//       publicUrl,
//       filename,
//       model,
//       seconds,
//       size,
//     });

//     return res.json({
//       video_id: result.video_id,
//       status: result.status,
//       message: 'Video generation started successfully',
//       note: 'Using mock video service for development. Set up Sora API for real video generation.',
//       debug: {
//         prompt_length: prompt.length,
//         has_input_file: !!publicUrl,
//         model,
//         seconds,
//         size
//       }
//     });

//   } catch (err: any) {
//     console.error('VIDEO CREATE ERROR:', err);
//     return res.status(500).json({
//       error: err?.message || 'Internal server error',
//     });
//   }
// });

// /**
//  * GET /api/video/status
//  */
// app.get('/api/video/status', async (req, res) => {
//   try {
//     const id = String(req.query.id || '');

//     if (!id) {
//       return res.status(400).json({ error: 'Video ID is required' });
//     }

//     console.log('Checking status for video ID:', id);

//     const status = await videoService.getVideoStatus(id);
//     return res.json(status);
    
//   } catch (err: any) {
//     console.error('STATUS ERROR:', err);
//     return res.status(500).json({
//       error: err?.message || 'Internal server error',
//     });
//   }
// });

// /**
//  * GET /api/models - List available models
//  */
// app.get('/api/models', async (req, res) => {
//   try {
//     // Get real models from OpenAI
//     const models = await openai.models.list();
    
//     // Filter for potential video models
//     const videoModels = models.data.filter(model => 
//       model.id.includes('video') || 
//       model.id.includes('sora') ||
//       model.id.includes('dall-e') // DALL-E for image generation alternative
//     );

//     // Add our mock model
//     videoModels.push({
//       id: 'sora-simulated',
//       object: 'model',
//       created: Date.now(),
//       owned_by: 'mock-service'
//     } as any);

//     return res.json({
//       models: videoModels,
//       note: 'Sora models may not be listed if not available in your account'
//     });
//   } catch (err: any) {
//     console.error('MODELS ERROR:', err);
//     return res.json({
//       models: [
//         { id: 'sora-simulated', object: 'model', created: Date.now(), owned_by: 'mock-service' }
//       ],
//       error: 'Could not fetch models from OpenAI',
//       note: 'Using mock model for development'
//     });
//   }
// });

// /* -----------------------------
//    ERROR HANDLING
// --------------------------------*/

// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// /* -----------------------------
//    START SERVER
// --------------------------------*/

// app.listen(PORT, () => {
//   console.log(`✅ Backend server running on http://localhost:${PORT}`);
//   console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
//   console.log(`⚡ Health check: http://localhost:${PORT}/health`);
//   console.log(`🎬 Video API: http://localhost:${PORT}/api/video/create`);
//   console.log(`📊 Models list: http://localhost:${PORT}/api/models`);
//   console.log('⚠️  IMPORTANT: Using mock video service for development.');
//   console.log('   To use real video generation:');
//   console.log('   1. Get access to OpenAI Sora API');
//   console.log('   2. Update the VideoGenerationService.tryOpenAIVideoGeneration() method');
//   console.log('   3. Remove mock service and use actual API calls');
// });import 'dotenv/config';


// import express from 'express';
// import cors from 'cors';
// import fetch from 'node-fetch'; // Add this import

// const app = express();
// const PORT = process.env.PORT || 3001;

// /* -----------------------------
//    MIDDLEWARE
// --------------------------------*/

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: '50mb' }));

// /* -----------------------------
//    TYPES
// --------------------------------*/

// interface VideoGenerationRequest {
//   prompt: string;
//   publicUrl?: string;
//   filename?: string;
//   model?: string;
//   seconds?: string;
//   size?: string;
//   mode?: string;
// }

// interface VideoResponse {
//   id: string;
//   status: 'processing' | 'completed' | 'failed';
//   progress?: number;
//   output_url?: string;
//   error?: string;
//   estimated_completion_time?: string;
//   completed_at?: string;
// }

// /* -----------------------------
//    RUNWAY ML CONFIGURATION
// --------------------------------*/

// const RUNWAY_API_KEY = process.env.RUNWAYML_API_KEY;
// const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';

// if (!RUNWAY_API_KEY) {
//   console.error('❌ RUNWAYML_API_KEY is not set in environment variables');
//   console.log('Using mock service instead. To use Runway ML:');
//   console.log('1. Get API key from https://runwayml.com');
//   console.log('2. Add RUNWAYML_API_KEY=your_key_here to .env file');
// }

// /* -----------------------------
//    VIDEO GENERATION SERVICE
// --------------------------------*/

// class VideoGenerationService {
//   private mockVideos: Map<string, VideoResponse> = new Map();

//   /**
//    * Create a video generation job with Runway ML or fallback to mock
//    */
//   async createVideo(request: VideoGenerationRequest): Promise<{ video_id: string; status: string; note?: string }> {
//     const { prompt, publicUrl, mode = 'text', model = 'gen-2', seconds = '8', size = '1280x720' } = request;

//     // Try Runway ML first if API key is available
//     if (RUNWAY_API_KEY) {
//       try {
//         return await this.createRunwayVideo(prompt, publicUrl, mode, model, seconds, size);
//       } catch (error) {
//         console.error('Runway ML creation failed, falling back to mock:', error);
//       }
//     }

//     // Fallback to mock service
//     return this.createMockVideo(prompt, publicUrl, mode);
//   }

//   /**
//    * Create video using Runway ML API
//    */
//   private async createRunwayVideo(
//     prompt: string, 
//     publicUrl?: string, 
//     mode: string = 'text',
//     model: string = 'gen-2',
//     seconds: string = '8',
//     size: string = '1280x720'
//   ): Promise<{ video_id: string; status: string; note?: string }> {
    
//     const endpoint = `${RUNWAY_API_BASE}/generate`;

//     // Prepare request body based on mode
//     const requestBody: any = {
//       prompt,
//       model,
//       duration: `${seconds}s`,
//       resolution: size,
//     };

//     // Handle different modes
//     if (mode === 'image' && publicUrl) {
//       requestBody.input_type = 'image';
//       requestBody.input_image = publicUrl;
//     } else if (mode === 'video' && publicUrl) {
//       requestBody.input_type = 'video';
//       requestBody.input_video = publicUrl;
//     }

//     try {
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${RUNWAY_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Runway ML API error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();

//       if (!data.id) {
//         throw new Error('Runway ML response missing job ID');
//       }

//       console.log('Runway ML job created:', data.id);

//       return {
//         video_id: data.id,
//         status: 'processing',
//         note: 'Using Runway ML API'
//       };

//     } catch (error: any) {
//       console.error('Runway ML API call failed:', error);
//       throw error;
//     }
//   }

//   /**
//    * Create mock video for development/fallback
//    */
//   private createMockVideo(prompt: string, publicUrl?: string, mode: string = 'text'): { video_id: string; status: string; note?: string } {
//     const videoId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     // Create mock video response
//     const mockVideo: VideoResponse = {
//       id: videoId,
//       status: 'processing',
//       progress: 0,
//       estimated_completion_time: new Date(Date.now() + 30000).toISOString(),
//     };

//     // Store in memory
//     this.mockVideos.set(videoId, mockVideo);

//     // Start simulated processing
//     this.simulateVideoProcessing(videoId);

//     return {
//       video_id: videoId,
//       status: 'processing',
//       note: 'Using mock service (Runway ML not configured)'
//     };
//   }

//   /**
//    * Simulate video processing for mock service
//    */
//   private simulateVideoProcessing(videoId: string): void {
//     let progress = 0;
    
//     const interval = setInterval(() => {
//       if (!this.mockVideos.has(videoId)) {
//         clearInterval(interval);
//         return;
//       }

//       progress += 10;
      
//       if (progress >= 100) {
//         // Video completed
//         const mockVideo = this.mockVideos.get(videoId);
//         if (mockVideo) {
//           mockVideo.status = 'completed';
//           mockVideo.progress = 100;
//           mockVideo.completed_at = new Date().toISOString();
          
//           // Generate a mock video URL
//           const sampleVideos = [
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
//             'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
//           ];
          
//           mockVideo.output_url = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
//           this.mockVideos.set(videoId, mockVideo);
//         }
//         clearInterval(interval);
//       } else {
//         // Update progress
//         const mockVideo = this.mockVideos.get(videoId);
//         if (mockVideo) {
//           mockVideo.progress = progress;
//           this.mockVideos.set(videoId, mockVideo);
//         }
//       }
//     }, 1000);
//   }

//   /**
//    * Get video status from Runway ML or mock service
//    */
//   async getVideoStatus(videoId: string): Promise<VideoResponse> {
//     // Check if it's a mock video
//     if (videoId.startsWith('mock_') && this.mockVideos.has(videoId)) {
//       const video = this.mockVideos.get(videoId);
//       if (video) {
//         return video;
//       }
//     }

//     // Try to get status from Runway ML
//     if (RUNWAY_API_KEY && !videoId.startsWith('mock_')) {
//       try {
//         return await this.getRunwayStatus(videoId);
//       } catch (error) {
//         console.error('Runway ML status check failed:', error);
//       }
//     }

//     // Fallback response
//     return {
//       id: videoId,
//       status: 'failed',
//       error: 'Video not found or service unavailable',
//     };
//   }

//   /**
//    * Get status from Runway ML API
//    */
//   private async getRunwayStatus(videoId: string): Promise<VideoResponse> {
//     const endpoint = `${RUNWAY_API_BASE}/generations/${videoId}`;

//     try {
//       const response = await fetch(endpoint, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${RUNWAY_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           return {
//             id: videoId,
//             status: 'failed',
//             error: 'Generation not found',
//           };
//         }
//         const errorText = await response.text();
//         throw new Error(`Runway ML API error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();

//       // Map Runway ML status to our status
//       const statusMap: Record<string, 'processing' | 'completed' | 'failed'> = {
//         'pending': 'processing',
//         'processing': 'processing',
//         'completed': 'completed',
//         'succeeded': 'completed',
//         'failed': 'failed',
//         'cancelled': 'failed'
//       };

//       const result: VideoResponse = {
//         id: videoId,
//         status: statusMap[data.status] || 'processing',
//         progress: data.progress || 0,
//       };

//       // If completed, extract the video URL
//       if ((data.status === 'completed' || data.status === 'succeeded') && data.output) {
//         result.output_url = data.output.url || data.output.video_url || data.output.video;
//         result.completed_at = new Date().toISOString();
//       }

//       // If failed, capture the error
//       if (data.status === 'failed' && data.error) {
//         result.error = data.error.message || data.error;
//       }

//       return result;

//     } catch (error: any) {
//       console.error('Runway ML status API call failed:', error);
//       return {
//         id: videoId,
//         status: 'failed',
//         error: `Failed to check status: ${error.message}`,
//       };
//     }
//   }
// }

// // Initialize service
// const videoService = new VideoGenerationService();

// /* -----------------------------
//    ROUTES
// --------------------------------*/

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     timestamp: new Date().toISOString(),
//     service: 'Video Generation API',
//     mode: RUNWAY_API_KEY ? 'Runway ML' : 'Mock Service',
//     note: RUNWAY_API_KEY ? 'Using Runway ML API' : 'Using mock service (configure RUNWAYML_API_KEY for real generation)'
//   });
// });

// /**
//  * POST /api/video/create
//  */
// app.post('/api/video/create', async (req, res) => {
//   try {
//     const {
//       prompt,
//       publicUrl,
//       filename = 'input',
//       model = 'gen-2',
//       seconds = '8',
//       size = '1280x720',
//       mode = 'text',
//     } = req.body;

//     console.log('Creating video with prompt:', prompt.substring(0, 100) + '...');
//     console.log('Mode:', mode, 'Model:', model);

//     if (!prompt || prompt.trim().length === 0) {
//       return res.status(400).json({ error: 'Prompt is required' });
//     }

//     // Validate size
//     const validSizes = ['1920x1080', '1280x720', '1080x1920', '720x1280'];
//     if (!validSizes.includes(size)) {
//       return res.status(400).json({ error: `Invalid size. Must be one of: ${validSizes.join(', ')}` });
//     }

//     // Validate seconds
//     const secondsNum = parseInt(seconds, 10);
//     if (isNaN(secondsNum) || secondsNum < 1 || secondsNum > 60) {
//       return res.status(400).json({ error: 'Seconds must be between 1 and 60' });
//     }

//     // Log input reference if provided
//     if (publicUrl) {
//       console.log('Input reference URL provided:', publicUrl);
//     }

//     // Create video using our service
//     const result = await videoService.createVideo({
//       prompt,
//       publicUrl,
//       filename,
//       model,
//       seconds,
//       size,
//       mode,
//     });

//     return res.json({
//       video_id: result.video_id,
//       status: result.status,
//       message: 'Video generation started successfully',
//       note: result.note,
//       debug: {
//         prompt_length: prompt.length,
//         has_input_file: !!publicUrl,
//         mode,
//         model,
//         seconds,
//         size
//       }
//     });

//   } catch (err: any) {
//     console.error('VIDEO CREATE ERROR:', err);
//     return res.status(500).json({
//       error: err?.message || 'Internal server error',
//     });
//   }
// });

// /**
//  * GET /api/video/status
//  */
// app.get('/api/video/status', async (req, res) => {
//   try {
//     const id = String(req.query.id || '');

//     if (!id) {
//       return res.status(400).json({ error: 'Video ID is required' });
//     }

//     console.log('Checking status for video ID:', id);

//     const status = await videoService.getVideoStatus(id);
//     return res.json(status);
    
//   } catch (err: any) {
//     console.error('STATUS ERROR:', err);
//     return res.status(500).json({
//       error: err?.message || 'Internal server error',
//     });
//   }
// });

// /**
//  * GET /api/models - List available models
//  */
// app.get('/api/models', (req, res) => {
//   const models = [
//     { id: 'gen-2', name: 'Runway Gen-2', description: 'Text/Image/Video to Video', provider: 'Runway ML' },
//     { id: 'mock-gen', name: 'Mock Generator', description: 'Development/testing only', provider: 'Mock Service' },
//   ];

//   if (RUNWAY_API_KEY) {
//     models.unshift({
//       id: 'runway-default',
//       name: 'Runway Default',
//       description: 'Latest Runway ML model',
//       provider: 'Runway ML'
//     });
//   }

//   return res.json({
//     models,
//     has_runway: !!RUNWAY_API_KEY,
//     note: RUNWAY_API_KEY ? 'Runway ML configured' : 'Runway ML not configured (using mock)'
//   });
// });

// /**
//  * GET /api/capabilities - Show what modes are supported
//  */
// app.get('/api/capabilities', (req, res) => {
//   const capabilities = {
//     text_to_video: true,
//     image_to_video: true,
//     video_to_video: true,
//     provider: RUNWAY_API_KEY ? 'Runway ML' : 'Mock Service',
//     max_duration: 60,
//     supported_resolutions: ['1920x1080', '1280x720', '1080x1920', '720x1280'],
//     has_api_key: !!RUNWAY_API_KEY
//   };

//   res.json(capabilities);
// });

// /* -----------------------------
//    ERROR HANDLING
// --------------------------------*/

// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error' });
// });

// /* -----------------------------
//    START SERVER
// --------------------------------*/

// app.listen(PORT, () => {
//   console.log(`✅ Backend server running on http://localhost:${PORT}`);
//   console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
//   console.log(`⚡ Health check: http://localhost:${PORT}/health`);
//   console.log(`🎬 Video API: http://localhost:${PORT}/api/video/create`);
//   console.log(`📊 Models list: http://localhost:${PORT}/api/models`);
  
//   if (RUNWAY_API_KEY) {
//     console.log('✅ Runway ML API configured');
//     console.log('⚠️  Note: Using real Runway ML API for video generation');
//   } else {
//     console.log('⚠️  WARNING: RUNWAYML_API_KEY not found in environment');
//     console.log('   Using mock service for video generation');
//     console.log('   To use Runway ML:');
//     console.log('   1. Get API key from https://runwayml.com');
//     console.log('   2. Add RUNWAYML_API_KEY=your_key_here to .env file');
//   }
// });