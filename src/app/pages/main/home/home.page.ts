import { Component, OnInit, inject } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { orderBy, where } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  products: Product[] = [];
  loading: boolean = false;

  ngOnInit() {}

  ionViewWillEnter() {
    this.getProducts();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  ////Obtener Ganancias////

  getProfits() {
    return this.products.reduce(
      (index, product) => index + product.price * product.soldUnits,
      0
    );
  }


  // ===========cerrar sesion=========

  signOut() {
    this.firebaseSvc.signOut();
  }

  // ==========Agregar o actualizar producto============

  async addUpdateProduct(product?: Product) {
    let success = await this.utilSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product },
    });

    if (success) this.getProducts();
  }

  user(): User {
    return this.utilSvc.getFromLocalStorage('user');
  }
  // ======== Funcion para traer los productos ======
  getProducts() {
    let path = `users/${this.user().uid}/products`;

    this.loading = true;

    // ===Ordenar====

    let query = [
      orderBy('soldUnits', 'desc'),
      //  where('soldUnits','>',30)
    ];

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        console.log(res);
        this.products = res;

        this.loading = false;

        sub.unsubscribe();
      },
    });
  }

  async confirmDelete(product) {
    this.utilSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este Producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        },
        {
          text: 'Si, Eliminar',
          handler: () => {
            this.deleteProduct(product);
          },
        },
      ],
    });
  }

  // ==== Eliminar Producto====

  async deleteProduct(product: Product) {
    // if (this.form.valid) {
    let path = `users/${this.user().uid}/products/${product.id}`;
    const loading = await this.utilSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc
      .deleteDocument(path)
      .then(async (res) => {
        this.products = this.products.filter((p) => p.id !== product.id); //devolveme la lista sin este producto

        this.utilSvc.presentToast({
          message: 'Producto Eliminado Exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.error(error);

        this.utilSvc.presentToast({
          message: error.message,
          duration: 3000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
    // }
  }
}
