export class StackDto {
  readonly id: string;
  readonly lastTransaction: string;
  readonly items: string[];
}

export class StackItemListDto {
  readonly items: String[];
}

export class StackResponseDto {
  readonly stack: StackDto;
}

export class MessageDto {
  readonly message: string;
}
