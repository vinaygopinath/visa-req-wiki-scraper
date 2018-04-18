export class CountryOutput {
  name: string;
  visa: string | null | undefined;
  note: string | null | undefined;

  constructor(name: string, visa?: string | null, note?: string | null) {
    this.name = name;

    if (visa) {
      this.visa = visa;
    }

    if (note) {
      this.note = note;
    }
  }
}
