import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';



@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
})
export class AddUpdateProductComponent  implements OnInit {

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    image: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl('', [Validators.required]), 
    soldUnits: new FormControl('', [Validators.required]), 

  });

  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  user= {} as User;

  // constructor(private firebaseSvc: FirebaseService) {}

  ngOnInit() {  
  this.user = this.utilSvc.getFromLocalStorage('user');}


  // ====TOMAR O SELECCIONAR IMAGEN=====


  async takeImage(){  
    const dataUrl= (await this.utilSvc.takePicture('Imagen del producto')).dataUrl;
    this.form.controls.image.setValue(dataUrl)
}




  



  async submit() {
    if (this.form.valid) {

      let path = `users/${this.user.uid}/products`;
      const loading = await this.utilSvc.loading();
      await loading.present();


      // Subir la imagen y obtener la url

      let dataUrl= this.form.value.image;
      let imagePath= `${this.user.uid}/${Date.now()}`;
      let imageUrl= await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.image.setValue(imageUrl);


      delete this.form.value.id

      this.firebaseSvc
        .addDocument(path, this.form.value)
        .then(async (res) => {

          this.utilSvc.dissmissModal({success: true});
      
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
    }
  }




  



}
