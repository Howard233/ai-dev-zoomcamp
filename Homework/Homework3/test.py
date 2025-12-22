from web_tools import download_page


def main() -> None:
    target_url = "https://github.com/alexeygrigorev/minsearch"
    content = download_page(target_url)
    print(f"Fetched {len(content)} characters from {target_url}")
    print(content[:1000])


if __name__ == "__main__":
    main()
