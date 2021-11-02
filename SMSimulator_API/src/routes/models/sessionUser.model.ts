export interface SessionUserDataModel {
    id: string;
    liquid: number;
}

export class SessionUser {
    data: SessionUserDataModel;
    sessions: [String]
    constructor(id, liquid) {
        this.data = { id: id, liquid: liquid };
    }
}