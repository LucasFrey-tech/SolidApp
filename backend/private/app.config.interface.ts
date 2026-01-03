export interface AppConfig {
  front_url: string;
  host: { port: number; url: string };
  database_connection: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  logger: {
    console_details_level: string;
    file_details_level: string;
    log_file: string;
    colorize_logs: boolean;
  };
}
