export interface IMusicAccidental {
  note: number;
  accidental: number;
}

export interface IMusicKeyParts {
  root: string;
  accidental: string;
  type: string;
}

export interface IMusicNoteParts {
  root: string;
  accidental: string;
}

export interface IMusicNoteValue {
  root_index: number;
  int_val: number;
}