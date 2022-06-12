import sys
import json
from time import sleep
from file_processor import process_file

sys.tracebacklimit = 0


def print_out(message: str):
    print(message, file=sys.stdout, flush=True)


def print_err(message: str):
    print(message, file=sys.stderr)


def my_custom_exception_handler(err_type: type, value: Exception, traceback):
    err_output = {
        "type": err_type.__name__,
        "message": str(value),
    }
    print_err(json.dumps(err_output))
    sys.exit(0)


sys.excepthook = my_custom_exception_handler


class MyCustomException(Exception):
    pass


if __name__ == '__main__':
    print_out("testing output at time 0")
    if len(sys.argv) > 1:
        result = process_file(sys.argv[1])
        print_out(f'Number of lines: {result[0]}\nNumber of bytes: {result[1]}\nNumber of letters: {result[2]}')
    # for line in sys.stdin:
    #     try:
    #         num = int(line)
    #         if num >= 0:
    #             sleep(num//1000)
    #             print_out(f'Waited {num} ms')
    #         else:
    #             raise MyCustomException('Attempted to wait negative amount of time.')
    #     except ValueError:
    #         # match line[:2]:
    #         #     case 'p ':
    #         #         print_out(f'"{line[2:-1]}"')
    #         #     case 'e ':
    #         #         raise MyCustomException(f'"{line[2:-1]}"')
    #         #     case 'b ':
    #         #         break
    #         #     case _:
    #         #         raise ValueError('Input did not match any patterns')
    #         first_two = line[:2]
    #         if first_two == 'p ':
    #             print_out(f'"{line[2:-1]}"')
    #         elif first_two == 'e ':
    #             raise MyCustomException(f'"{line[2:-1]}"')
    #         elif first_two == 'b ':
    #             break
    #         else:
    #             raise ValueError('Input did not match any patterns')

