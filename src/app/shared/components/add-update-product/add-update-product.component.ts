import { Component, OnInit, inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
})
export class AddUpdateProductComponent implements OnInit {
  @Input() product: Product;

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl(null, [Validators.required]),
    soldUnits: new FormControl(null, [Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  user = {} as User;

  // constructor(private firebaseSvc: FirebaseService) {}

  ngOnInit() {
    this.user = this.utilSvc.getFromLocalStorage('user');
    if (this.product) this.form.setValue(this.product);
  }

  // ====TOMAR O SELECCIONAR IMAGEN=====

  async takeImage() {
    const dataUrl = (await this.utilSvc.takePicture('Imagen del producto'))
      .dataUrl;
    this.form.controls.image.setValue(dataUrl);
  }

  submit() {
    if (this.form.valid) {
      if (this.product) this.updateProduct();
      else this.createProduct();
    }
  }

///============Convierte valores de tipo string a number==========

setNumberInputs(){ 

let {soldUnits, price} = this.form.controls;

if(soldUnits.value) soldUnits.setValue(parseFloat(soldUnits.value));
if(price.value) price.setValue(parseFloat(price.value));


}


  // ====Crear Producto====

  async createProduct() {
    // if (this.form.valid) {
    let path = `users/${this.user.uid}/products`;
    const loading = await this.utilSvc.loading();
    await loading.present();

    // Subir la imagen y obtener la url

    let dataUrl = this.form.value.image;
    let imagePath = `${this.user.uid}/${Date.now()}`;
    let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
    this.form.controls.image.setValue(imageUrl);

    delete this.form.value.id;

    this.firebaseSvc
      .addDocument(path, this.form.value)
      .then(async (res) => {
        this.utilSvc.dissmissModal({ success: true });

        this.utilSvc.presentToast({
          message: 'Producto Creado Exitosamente',
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

  // ==== Actualizar Producto====

  async updateProduct() {
    // if (this.form.valid) {
    let path = `users/${this.user.uid}/products/${this.product.id}`;
    const loading = await this.utilSvc.loading();
    await loading.present();

    // Sui cambio la imagen, subir la nueva y obtener la url======

    if (this.form.value.image !== this.product.image) {
      let dataUrl = this.form.value.image;
      // let imagePath = `${this.user.uid}/${Date.now()}`;
      let imagePath = await this.firebaseSvc.getFilePath(this.product.image);
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);
    }

    delete this.form.value.id;

    this.firebaseSvc
      .updateDocument(path, this.form.value)
      .then(async (res) => {
        this.utilSvc.dissmissModal({ success: true });

        this.utilSvc.presentToast({
          message: 'Producto Actualizado Exitosamente',
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
