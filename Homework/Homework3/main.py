from fastmcp import FastMCP

from web_tools import download_page

mcp = FastMCP("Demo 🚀")

@mcp.tool
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

mcp.tool(download_page)

if __name__ == "__main__":
    mcp.run(transport="stdio")
