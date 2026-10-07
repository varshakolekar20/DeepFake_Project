import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, BookOpen } from 'lucide-react';

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const vivaQuestions = [
    {
      q: "1. What is the core objective of the DeepGuard project?",
      a: "DeepGuard is an explainable deepfake and AI-generated media detection system. It analyzes uploaded facial images/videos and synthetic images using deep convolutional neural networks (EfficientNet-B0) and provides visual attention heatmaps (Grad-CAM) alongside calibrated, honest forensic verdicts."
    },
    {
      q: "2. Why did you choose EfficientNet-B0 over ResNet-18 as your primary model?",
      a: "EfficientNet-B0 uses compound scaling (balancing depth, width, and resolution) and depthwise separable convolutions. With only 5.3 million parameters compared to ResNet-18's 11.7 million, it achieves higher accuracy (92.4% vs 88.6% on FF++) while running substantially faster on CPU during web inference (~38ms vs ~52ms)."
    },
    {
      q: "3. What is Data Leakage in deepfake detection, and how did you prevent it?",
      a: "Data leakage happens when frames from the same video or identity appear in both training and test sets, artificially inflating test accuracy. We prevented this by grouping all original videos and their manipulated derivatives strictly into the same split BEFORE extracting any frames."
    },
    {
      q: "4. Why do you use separate detectors for Facial Manipulation and AI-Generated Images?",
      a: "Facial manipulation methods (DeepFakes, Face2Face) alter local facial features, requiring bounding-box extraction with margin padding to inspect blend seams. In contrast, AI generators (Midjourney, Stable Diffusion) produce global synthetic textures across entire scenes (landscapes, objects, lighting) where faces may not exist."
    },
    {
      q: "5. How does Grad-CAM work in simple terms?",
      a: "Grad-CAM (Gradient-weighted Class Activation Mapping) calculates the gradient of the predicted class score with respect to the feature maps in the final convolutional layer. It weights each feature map by its gradient importance, sums them, and applies a ReLU function to highlight exactly which spatial pixels influenced the positive prediction."
    },
    {
      q: "6. Can Grad-CAM be considered legal proof that a specific pixel was modified?",
      a: "No. Grad-CAM shows where the neural network focused its attention, not an immutable record of pixel tampering. It explains the model's decision process, serving as supporting forensic evidence rather than absolute legal proof."
    },
    {
      q: "7. What is the 'Honest Dual-Threshold Decision Rule'?",
      a: "Standard binary classifiers use a naive 0.5 cutoff. DeepGuard uses two calibrated thresholds: ≥0.65 for 'Likely Manipulated', ≤0.35 for 'Likely Authentic', and the middle zone (0.35 to 0.65) is flagged as 'Inconclusive'. This prevents borderline, uncertain predictions from being presented as high-confidence verdicts."
    },
    {
      q: "8. Why doesn't 'Likely Authentic' mean the media or story is verified as true?",
      a: "Authenticity within DeepGuard only means that no convolutional synthetic artifacts learned from our datasets were detected in the analyzed region. It cannot verify whether an event actually occurred, whether audio was re-dubbed, or whether old footage was taken out of context."
    },
    {
      q: "9. How does DeepGuard analyze video files?",
      a: "DeepGuard uniformly samples frames across the video timeline (e.g. 1 frame per second up to 30 frames), detects and crops faces in each frame, runs CNN inference, and aggregates scores using a combination of top-k suspicious frame pooling (70%) and mean pooling (30%)."
    },
    {
      q: "10. Why is top-k pooling preferred over pure average pooling for video aggregation?",
      a: "In realistic deepfake videos, manipulation may occur only during specific seconds (e.g., when a subject turns to the camera). Pure average pooling would dilute a brief 2-second deepfake across a 30-second authentic clip, resulting in a false negative. Top-k pooling ensures brief swaps are captured."
    },
    {
      q: "11. What happens if a video has no detectable human faces?",
      a: "DeepGuard outputs an honest 'Unable to Analyze' verdict explaining that no faces were detected. It never erroneously labels an empty or non-human video as 'Likely Authentic'."
    },
    {
      q: "12. What image quality checks are performed before inference?",
      a: "We compute the Variance of the Laplacian to detect severe motion blur (variance < 35.0), check pixel contrast standard deviation, and verify that detected face crops meet a minimum resolution of 40x40 pixels."
    },
    {
      q: "13. Why is margin padding added around detected face bounding boxes?",
      a: "Most face-swapping algorithms paste a synthesized facial mask onto a target head. The most tell-tale artifacts (blending seams, skin tone mismatches, boundary blur) appear along the jawline, chin, and hairline. Padding by 25% ensures the CNN sees these critical transition boundaries."
    },
    {
      q: "14. What loss function was used to train the models?",
      a: "We used Binary Cross-Entropy with Logits (`BCEWithLogitsLoss`), which combines a Sigmoid layer and standard BCELoss into a single mathematically stable layer using the log-sum-exp trick to prevent numerical instability."
    },
    {
      q: "15. What optimizer and learning rate schedule were used?",
      a: "AdamW optimizer with weight decay of 1e-4. We utilized a two-stage training scheme: first freezing the backbone to train the linear classification head (lr=1e-3), followed by fine-tuning top convolutional blocks with Cosine Annealing learning rate decay down to 1e-5."
    },
    {
      q: "16. Why does model accuracy drop when tested on Celeb-DF v2 compared to FaceForensics++?",
      a: "FaceForensics++ manipulation methods produce more noticeable boundary and resolution artifacts. Celeb-DF v2 uses advanced color correction and temporal smoothing, introducing a domain shift that challenges models trained exclusively on FF++. This drop (from 92.4% to 78.2%) highlights the generalization challenge in deepfake detection."
    },
    {
      q: "17. What are shortcut artifacts (Clever Hans effect) in deep learning?",
      a: "A model might inadvertently learn dataset artifacts (such as specific camera JPEG compression qualities, image resolutions, or file headers) rather than actual facial manipulation. We mitigate this through controlled JPEG quality perturbation tests and normalization."
    },
    {
      q: "18. How do you distinguish normal user upload inference from training with unlabeled data?",
      a: "Normal user inference takes an unlabelled file, extracts features, and outputs a prediction. Training with unlabeled data refers to semi-supervised learning techniques (like pseudo-labeling or contrastive pretraining) where the model learns representations from unannotated collections. DeepGuard never automatically retrains itself on user uploads without explicit consent and curation."
    },
    {
      q: "19. What datasets are standard in this research area?",
      a: "FaceForensics++ (FF++), Celeb-DF v2, Deepfake Detection Challenge (DFDC), and WildDeepfake for facial manipulation; and GenImage, DiffusionDB, and CIFAKE for general synthetic images."
    },
    {
      q: "20. How are video jobs handled in the backend?",
      a: "FastAPI handles video uploads asynchronously using Python's `BackgroundTasks`. The client receives an unguessable job ID, and polls progress (0% to 100%) while OpenCV samples frames in the background without blocking server threads."
    },
    {
      q: "21. How is temporary media cleaned up to preserve user privacy?",
      a: "Uploaded media files are stored with randomly generated UUID filenames in a secure `temp_uploads/` directory and are automatically deleted upon job completion, failure, cancellation, or after 1 hour."
    },
    {
      q: "22. Why did you use PyTorch instead of TensorFlow or Keras?",
      a: "PyTorch offers intuitive dynamic computation graphs, direct Pythonic access to forward/backward hooks (essential for Grad-CAM implementation), native torchvision pretrained weights, and seamless export to TorchScript or ONNX."
    },
    {
      q: "23. How does DeepGuard handle multiple faces in a single image?",
      a: "DeepGuard detects all faces independently, processes each through the CNN, generates per-face bounding boxes and risk scores, and flags the overall image if any detected face exhibits synthetic manipulation patterns."
    },
    {
      q: "24. What are the main failure modes of CNN-based deepfake detectors?",
      a: "Heavy social media re-compression (e.g. WhatsApp/TikTok re-encoding), extreme low lighting, strong motion blur, and entirely new generative architectures (e.g., modern diffusion face-swappers) not represented in the training distribution."
    },
    {
      q: "25. What future extensions are planned for DeepGuard?",
      a: "1. Multi-modal detection integrating synthetic audio detection (spectral frequency analysis). 2. Temporal modeling using CNN + LSTM or Video Vision Transformers (ViViT) to detect inter-frame flickering."
    }
  ];

  const filteredQuestions = vivaQuestions.filter(
    item => item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Frequently Asked Questions & Viva Guide
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          25 comprehensive examination questions and technical answers for your project review and viva voce.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search viva topics (Grad-CAM, EfficientNet, Leakage...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Question Accordion */}
      <div className="space-y-3">
        {filteredQuestions.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex justify-between items-center space-x-4 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-teal-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-navy-950/40">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
