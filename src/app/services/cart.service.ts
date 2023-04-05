import {Injectable} from '@angular/core';
import {ProductService} from "./product.service";
import {BehaviorSubject} from "rxjs";
import {CartModelPublic, CartModelServer} from "../models/cart.model";
import {ProductModelServer} from "../models/product.model";
import {HttpClient} from "@angular/common/http";
import {NavigationExtras, Router} from "@angular/router";
import {OrderService} from "./order.service";
import {ServerResponse} from "../models/product.model"

@Injectable({
  providedIn: 'root'
})
export class CartService {


  private serverURL='http://localhost:8000/api';

//DATA VARIABLE TO STORE THE CART INFO ON THE CLIENT'S LOCAL STORAGE
private cartDataClient: CartModelPublic = {
        total:0,
        proData:[{
          incart:0,
          id:0,
        }]
   }; 


   //DATA VARIABLE TO STORE THE CART INFO ON SERVER
   private cartDataServer: CartModelServer = {
    total:0,
    data:[{
     
      Product:undefined,
      numInCart:0
      
    }]
    
  };

  cartTotal$ = new BehaviorSubject<number>(0);
  cartDataObs$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);



  constructor(private http:HttpClient,private productService:ProductService,private orderService: OrderService,
    private router: Router,) {

      this.cartTotal$.next(this.cartDataServer.total);
     this.cartDataObs$.next(this.cartDataServer);

     //grt in fo from local storage

     let info:CartModelPublic = JSON.parse(localStorage.getItem('cart));

     if(info!==null && info!==undefined && info.proData) {
      //local storage is not empty
           this.cartDataClient=info;

           //loop by each entry and put it in cartDataServer object

           this.cartDataClient.proData.forEach(p=>{
            this.productService.getSingleProduct(p.id).subscribe((actualProductInfo:ProductModelServer)=>{
              if(this.cartDataServer.data[0].numInCart==0)
              {
                     this.cartDataServer.data[0].numInCart=p.incart;
                     this.cartDataServer.data[0].Product=actualProductInfo;

                     //todo create calculate total fuNCTION AND REPLACE
                     this.cartDataClient.total = this.cartDataServer.total;
                     localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              }

              else {

                // ALREADY HAS ENTRY
                this.cartDataServer.data.push({
                  numInCart: p.incart,
                  Product:actualProductInfo
                });
                //this.CalculateTotal();
                this.cartDataClient.total = this.cartDataServer.total;
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              }

              this.cartDataObs$.next({...this.cartDataServer});
              
            }
            )
           })
   }
}

      AddProductToCart(id: number,quantity?: number) {

        this.productService.getSingleProduct(id).subscribe(prod=>{
          //empty cart
          if(this.cartDataServer.data[0].Product==undefined )
          {
            this.cartDataServer.data[0].Product=prod;
            this.cartDataServer.data[0].numInCart=quantity!=undefined?quantity:1;

            //todo calculate total amount

            //add client data
            this.cartDataClient.proData[0].incart=this.cartDataServer.data[0].numInCart;
            this.cartDataClient.proData[0].id=prod.id;
            this.cartDataClient.total=this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            this.cartDataObs$.next({...this.cartDataServer})
            //TODO DISPLAY A TOAST NOTIFICATION

          }

            //has some items to add

            else{
              let index=this.cartDataServer.findIndex(p=>p.Product.id==prod.id);


        //item already in cart

                if(index!=-1)
                {
                  if(quantity!=undefined && quantity<=prod.quantity)
                  {
                    this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
                  }else{
                    this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
                  }

                  this.cartDataClient.proData[index].incart=this.cartDataServer.data[index].numInCart;

                  //todo display a notificstion
                }


        //item not in cart

        else{


          this.cartDataServer.data.push({
            numInCart:1,
            Product:prod
        });


        this.cartDataClient.proData.push({
          incart:1,
          id:prod.id
      });

           //todo notificstion

           //todo calculate amount of cart


           this.cartDataClient.total=this.cartDataServer.total;
           localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
           this.cartDataObs$.next({...this.cartDataServer});



        }// else end

            }

        });
        
      }

      //same product a bar bar click korle add houar jonno

      UpdateCartItems(index:number,increase:boolean)
      {
        let data =this.cartDataServer.data[index];

        if(increase)
        {
          data.numInCart<data.Product.quantity?data.numInCart++:data.Product.quantity;
          //CALCULATE

          this.cartDataClient.total=this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartDataObs$.next({...this.cartDataServer});

        }

        else{
          data.numInCart--;

          if(data.numInCart<1)
          {
            //delete prod from cart

            this.cartDataObs$.next({...this.cartDataServer});
          }
          else{

            this.cartDataObs$.next({...this.cartDataServer});
            this.cartDataClient.proData[index].incart=data.numInCart;
            this.cartDataClient.total=this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            

          }
        }

      }


      DeleteProductFromCart(index:number) {
       //ask user to delete product
    
        if (window.confirm('Are you sure you want to delete the item?')) {
          this.cartDataServer.data.splice(index, 1);
          this.cartDataClient.proData.splice(index,1)
          
         // this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
    
          if (this.cartDataClient.total === 0) {
            this.cartDataClient ={
              total:0,
              proData:[{
                incart:0,
                id:0
              }]
            };


            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
    
          if (this.cartDataServer.total === 0) {
            this.cartDataServer = {
              data: [{
                product: undefined,
                numInCart: 0
              }],
              total: 0
            };
            this.cartDataObs$.next({...this.cartDataServer});
          } else {
            this.cartDataObs$.next({...this.cartDataServer});
          }
        }
        // If the user clicks on cancel button
        else {
          return;
        }
    
    
      }


      private CalculateTotal() {
        let Total = 0;
    
        this.cartDataServer.data.forEach(p => {
          const {numInCart} = p;
          const {price} = p.Product;
          // @ts-ignore
          Total += numInCart * price;
        });
        this.cartDataServer.total = Total;
        this.cartTotal$.next(this.cartDataServer.total);
      }

      CheckoutFromCart(userId:number){ 
       this.http.post('${this.serverURL}/orders/payment',null).subscribe((res:
        {success: boolean})=>{

          if(res.success)
          {   //only place using client object
                this.resetServerData();
                this.http.post('${this.serverURL}/orders/ new',{
                  userId:userId,
                  products:this.cartDataClient.proData
                }).subscribe((data:OrderResponse)=>{


                  this.orderService.getSingleOrder(data.order_id).then(prods=>{

                    if(data.success)
                    {
                       const navigationExtras:NavigationExtras = {
  
                            state:{
                              message: data.message,
                              products: prods,
                              orderId: data.order_id,
                              total: this.cartDataClient.total
                            }
                       };

                       //todo wide spinner 

                       this.router.navigate(['/thankyou'],navigationExtras).then(p=>
                        {
                           this.cartDataClient={total:0,proData:[{incart:0,id:0}]};
                           this.cartTotal$.next(0);
                           localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                        });
                    }

                  })

                 
                });
          }

        });

      }

      private resetServerData(){ 
        this.cartDataServer={
          total:0,
          data:[{
            numInCart:0,
            Product:undefined
          }]
        };

        this.cartDataObs$.next({...this.cartDataServer});
      }
    

}

interface OrderResponse {
  order_id: Number;
  success: Boolean;
  message: String;
  products: [{
    id: String,
    numInCart: String
  }];
}