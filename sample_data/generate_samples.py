import os
import cv2
import numpy as np

def generate_samples(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    print(f"[DeepGuard] Generating demo sample assets in {output_dir}...")

    # 1. Realistic portrait-like placeholder (Sample Authentic Face)
    img_real = np.zeros((300, 300, 3), dtype=np.uint8)
    # Background gradient
    for y in range(300):
        img_real[y, :] = [int(180 - y*0.2), int(190 - y*0.2), int(205 - y*0.2)]
    # Head ellipse
    cv2.ellipse(img_real, (150, 150), (65, 85), 0, 0, 360, (190, 160, 140), -1)
    # Eyes
    cv2.circle(img_real, (125, 130), 8, (60, 40, 30), -1)
    cv2.circle(img_real, (175, 130), 8, (60, 40, 30), -1)
    # Mouth
    cv2.ellipse(img_real, (150, 185), (20, 8), 0, 0, 180, (120, 70, 70), -1)
    # Smooth blur to make it natural
    img_real = cv2.GaussianBlur(img_real, (5, 5), 0)
    real_path = os.path.join(output_dir, "sample_real_face.jpg")
    cv2.imwrite(real_path, img_real)
    print(f"Generated: {real_path}")

    # 2. Manipulated Deepfake placeholder (with sharp seam boundary & color mismatch)
    img_fake = img_real.copy()
    # Swap inner face with a color-shifted, sharpened rectangular region (classic swap artifact)
    inner_patch = img_fake[100:200, 100:200].copy()
    inner_patch[:, :, 0] = np.clip(inner_patch[:, :, 0] * 1.25, 0, 255) # blue/cyan tint mismatch
    inner_patch[:, :, 2] = np.clip(inner_patch[:, :, 2] * 0.85, 0, 255)
    # Add boundary seam discontinuity
    cv2.rectangle(img_fake, (100, 100), (200, 200), (140, 110, 90), 2)
    img_fake[101:199, 101:199] = inner_patch[1:99, 1:99]
    fake_path = os.path.join(output_dir, "sample_deepfake_face.jpg")
    cv2.imwrite(fake_path, img_fake)
    print(f"Generated: {fake_path}")

    # 3. AI-Generated Synthetic Art placeholder (high frequency diffusion patterns)
    img_aigen = np.zeros((300, 300, 3), dtype=np.uint8)
    for x in range(300):
        for y in range(300):
            val1 = int(127 + 127 * np.sin(x / 10.0) * np.cos(y / 10.0))
            val2 = int(127 + 127 * np.cos((x + y) / 15.0))
            img_aigen[y, x] = [val1, val2, 200]
    aigen_path = os.path.join(output_dir, "sample_synthetic_art.jpg")
    cv2.imwrite(aigen_path, img_aigen)
    print(f"Generated: {aigen_path}")

    # 4. Short 3-second demo video (sample_video.mp4)
    video_path = os.path.join(output_dir, "sample_video.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(video_path, fourcc, 10.0, (300, 300))
    # 30 frames = 3 seconds at 10 fps
    for i in range(30):
        frame = img_real.copy()
        # In frames 15 to 25, simulate a brief deepfake face swap insertion
        if 15 <= i <= 25:
            frame[100:200, 100:200] = img_fake[100:200, 100:200]
        out.write(frame)
    out.release()
    print(f"Generated: {video_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    generate_samples(current_dir)
