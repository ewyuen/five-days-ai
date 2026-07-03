from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI()

def main():
    print("Calling OpenAI API for a single chat completion...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": "In one sentence, what is an AI engineer?"},
        ],
    )
    print("\nResponse:")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
