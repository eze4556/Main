import { Component, OnInit, inject } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  products: Product[] = [];

  ngOnInit() {}

  ionViewWillEnter() {
    this.getProducts();
  }

  // ===========cerrar sesion=========

  signOut() {
    this.firebaseSvc.signOut();
  }

  // ==========Agregar o actualizar producto============

  addUpdateProduct() {
    this.utilSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
    });
  }

  user(): User {
    return this.utilSvc.getFromLocalStorage('user');
  }
  // ======== Funcion para traer los productos ======
  getProducts() {
    let path = `users/${this.user().uid}/products`;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.products= res;
        sub.unsubscribe();
      },
    });
  }
}
