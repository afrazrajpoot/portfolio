import { Client, Databases, Storage, ID, Account, Query } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

export { client, databases, storage, account, ID, Query };
