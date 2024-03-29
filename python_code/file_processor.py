from sys import argv


def process_file(filepath: str) -> tuple[int, int, int]:
    num_lines = 0
    num_chars = 0
    num_letter_chars = 0
    all_letters = "qwertyuiopasdfghjklzxcvbnm"
    letters_set = set(all_letters + all_letters.upper())

    CHUNK_SIZE: int = 100000

    with open(filepath, 'rb') as file:
        while file_bytes := file.read(CHUNK_SIZE):
            for byte in file_bytes:
                num_chars += 1
                try:
                    char = chr(byte)
                    if char == '\n':
                        num_lines += 1
                    elif char in letters_set:
                        num_letter_chars += 1
                except UnicodeDecodeError:
                    pass

    return num_lines, num_chars, num_letter_chars


if __name__ == '__main__':
    result = process_file(sys.argv[1])
    print('\n'.join(str(item) for item in result))

