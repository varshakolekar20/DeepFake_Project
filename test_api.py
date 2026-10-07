import requests

# 1. Real Photograph Test (192960.jpg in Facial Mode)
url_real_face = "http://127.0.0.1:8000/api/v1/analyze/image?mode=facial"
files_real = {"file": open(r"C:\Users\Varsha Kolekar\Pictures\192960.jpg", "rb")}
res_real = requests.post(url_real_face, files=files_real).json()
print("1. Real Photo in Facial Mode:")
print("   Verdict:", res_real.get("verdict"))
print("   Score:", res_real.get("percentage"), "%")

# 2. Real Photograph in AI-Generated Image Mode
url_real_ai = "http://127.0.0.1:8000/api/v1/analyze/image?mode=aigen"
files_real_ai = {"file": open(r"C:\Users\Varsha Kolekar\Pictures\192960.jpg", "rb")}
res_real_ai = requests.post(url_real_ai, files=files_real_ai).json()
print("\n2. Real Photo in AI-Generated Mode:")
print("   Verdict:", res_real_ai.get("verdict"))
print("   Score:", res_real_ai.get("percentage"), "%")

# 3. Manipulated Face Test
url_fake = "http://127.0.0.1:8000/api/v1/analyze/image?mode=facial"
files_fake = {"file": open("sample_data/sample_deepfake_face.jpg", "rb")}
res_fake = requests.post(url_fake, files=files_fake).json()
print("\n3. Manipulated Sample in Facial Mode:")
print("   Verdict:", res_fake.get("verdict"))
print("   Score:", res_fake.get("percentage"), "%")
