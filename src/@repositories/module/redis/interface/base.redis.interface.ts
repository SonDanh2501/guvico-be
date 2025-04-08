
export interface BaseRedisRepositoryInterface<T> {

    returnIsReadyConnect();

    findOneById(id: string): Promise<any | null>;

    saveItem(payload: Object): Promise<any | boolean>;

    findByIdAndUpdate(id: string, payload: Object): Promise<any | boolean>;

    findByIdAndDelete(id: string): Promise<any | boolean>;

}
