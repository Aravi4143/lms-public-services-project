const {
    TableClient,
    AzureNamedKeyCredential,
  } = require("@azure/data-tables");

export default function tableClient(tableName: String) {
    return TableClient.fromConnectionString(
        process.env.AzureWebJobsStorage,
        tableName
      );
    return new TableClient(
        process.env.TABLE_URL,
        tableName,
        new AzureNamedKeyCredential(process.env.BLOB_ACCOUNT_NAME, process.env.BLOB_ACCOUNT_KEY)
      );
}