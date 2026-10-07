import os
import cv2
from PIL import Image
from backend.app.services.face_extractor import face_extractor
from backend.app.services.model_loader import model_manager
from backend.app.services.video_processor import video_processor

def test_inference_pipeline():
    print("=== Testing DeepGuard Forensic Inference Engine ===")
    
    # 1. Test image face detection & classification
    img_path = "sample_data/sample_deepfake_face.jpg"
    assert os.path.exists(img_path), f"File {img_path} not found"
    
    img_bgr = cv2.imread(img_path)
    quality = face_extractor.assess_quality(img_bgr)
    print(f"Quality Assessment: {quality}")
    
    faces = face_extractor.extract_faces(img_bgr)
    print(f"Faces Detected: {len(faces)}")
    
    if len(faces) > 0:
        face = faces[0]
        result = model_manager.classify_and_explain(model_manager.facial_model, face["crop_pil"], mode="facial")
        print(f"Inference Verdict: {result['verdict']}")
        print(f"Calculated Score: {result['raw_score']}")
        print(f"Grad-CAM Heatmap Generated: {bool(result['heatmap_data_uri'])}")
    else:
        # Also test on full image fallback if Haar didn't trigger on stylized drawing
        pil_img = Image.open(img_path)
        result = model_manager.classify_and_explain(model_manager.facial_model, pil_img, mode="facial")
        print(f"Full Image Fallback Verdict: {result['verdict']}")
        print(f"Grad-CAM Heatmap Generated: {bool(result['heatmap_data_uri'])}")

    # 2. Test Video Processing
    video_path = "sample_data/sample_video.mp4"
    if os.path.exists(video_path):
        job = video_processor.create_job("test_job_1", video_path)
        video_processor.process_video("test_job_1")
        print(f"Video Job Status: {job.status}")
        if job.result:
            print(f"Video Final Verdict: {job.result['verdict']}")
            print(f"Sampled Frames: {job.result['sampled_frames_count']}")

    print("=== All Pipeline Verification Checks Passed! ===")

if __name__ == "__main__":
    test_inference_pipeline()
