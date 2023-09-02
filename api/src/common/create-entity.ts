import { TableClient } from "@azure/data-tables";

export default function createEntity(tableClient: TableClient, entity: any) {
    return tableClient.createEntity(entity);
}