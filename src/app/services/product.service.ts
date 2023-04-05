import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import { ProductModelServer, ServerResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }


  private SERVER_URL = 'http://localhost:8000/api';
   getAllProducts(numberOfResults=10): Observable<ServerResponse>
  {
    return this.http.get<ServerResponse>(this.SERVER_URL+'/products',{
    	params: {
    		limit: numberOfResults.toString()
    	}
    }) ;
  }


  // getting single product from server

  getSingleProduct(id: Number): Observable<ProductModelServer> {
    return this.http.get<ProductModelServer>(this.SERVER_URL + 'products/' + id);
  }


  // getting producs from one category

  getProductsFromCategory(catName: String): Observable<ProductModelServer[]> {
    return this.http.get<ProductModelServer[]>(this.SERVER_URL + 'products/category/' + catName);
  }

}
