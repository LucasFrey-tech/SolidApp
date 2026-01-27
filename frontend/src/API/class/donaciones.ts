import type { Donation } from "@/API/types/donaciones";

export class DonationsService {
  private baseUrl: string;
  private token?: string;

  constructor(token?: string) {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    this.token = token;
  }

  private getHeaders() {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async getAll(): Promise<Donation[]> {
    const res = await fetch(`${this.baseUrl}/donations`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  async getById(id: number): Promise<Donation> {
    const res = await fetch(`${this.baseUrl}/donations/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    return res.json();
  }
}
