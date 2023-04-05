
import { ProductModelServer } from "./product.model";
export interface CartModelServer{
    total:number;
    data:[{
        Product:ProductModelServer,
        numInCart:number
    }];

}

export interface CartModelPublic{

    total:number;
    proData:[{
        id:number,
        incart:number
    }];

    
}