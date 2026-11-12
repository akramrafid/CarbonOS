import asyncio
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get('/test')
def t():
    return {'ok': True}

async def main():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as c:
        r = await c.get('/test')
        print("STATUS:", r.status_code, r.json())

if __name__ == "__main__":
    asyncio.run(main())

