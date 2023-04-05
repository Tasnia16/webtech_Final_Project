import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductModelServer, ServerResponse } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  products: ProductModelServer[] =[];
  constructor(private product: ProductService,private router:Router ){}
  ngOnInit(): void 
  {
    this.product.getAllProducts().subscribe((prods:ServerResponse)=>this.products=prods.products);
  }

  selectProduct(id: number):void 
  {
    this.router.navigate(['/product',id]).then();
  }



}
