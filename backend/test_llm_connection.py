import sys
import os
import json
import asyncio
from pathlib import Path
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Tìm và load .env
env_paths = [
    Path(__file__).parent / ".env",
    Path(__file__).parent.parent / ".env",
    Path(".env")
]
loaded = False
for p in env_paths:
    if p.exists():
        load_dotenv(p, override=True)
        print(f"-> Da load file cau hinh: {p.resolve()}")
        loaded = True
        break

if not loaded:
    print("[CANH BAO] Khong tim thay file .env!")

api_key = os.getenv("OPENAI_API_KEY", "").strip()
base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
model = os.getenv("MODEL_NAME", "gpt-4o-mini").strip()

print(f"\n--- THONG SO CAU HINH OPENAI PATTERN ---")
print(f"Base URL : {base_url}")
print(f"Model    : {model}")
if not api_key or api_key == "your_api_key_here":
    print(f"API Key  : [CHUA DIEN KEY] (Hien tai la: '{api_key}')")
    print("\n=> HAY MO FILE '.env' VA DIEN API KEY THAT CUA BAN VAO DONG: OPENAI_API_KEY=...")
    sys.exit(1)
else:
    masked_key = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "***"
    print(f"API Key  : {masked_key} (Hop le)")

async def test_call():
    from openai import AsyncOpenAI
    print("\nDang ket noi toi LLM qua OpenAI pattern...")
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Ban la he thong kiem tra an toan mang. Luon tra ve JSON hop le."},
                {"role": "user", "content": "Hay tra ve JSON: {\"status\": \"connected\", \"message\": \"Xin chao tu LLM that!\"}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        content = response.choices[0].message.content
        print("\n[KET QUA THANH CONG!]")
        print("Phan hoi tu LLM that:")
        print(content)
        print("\n=> He thong da ket noi voi LLM that thanh cong 100%!")
    except Exception as e:
        print("\n[THAT BAI] Khong the ket noi toi LLM:")
        print(f"Chi tiet loi: {e}")
        print("\nCac nguyen nhan thuong gap:")
        print("1. API Key khong chinh xac hoac het han/het credit.")
        print("2. Base URL khong dung voi provider cua key.")
        print("3. Model name khong ton tai hoac tai khoan khong co quyen truy cap model do.")

if __name__ == "__main__":
    asyncio.run(test_call())
