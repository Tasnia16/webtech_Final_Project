import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  products:ProductResponseModel[] =[];
  private Server_Url='http://localhost:8000/api';

  constructor(private http:HttpClient) { }

  getSingleOrder(orderId: Number) {
    return this.http.get<ProductResponseModel[]>(this.Server_Url+'/orders'+orderId).toPromise
  }

}


interface ProductResponseModel {
  id: Number;
  title: String;
  description: String;
  price: Number;
  quantityOrdered: Number;
  image: String;
}

