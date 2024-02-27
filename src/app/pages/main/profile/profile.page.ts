import { Component, OnInit, inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

 firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

 user(): User {
    return this.utilSvc.getFromLocalStorage('user');
  }

  async takeImage() {
    let user = this.user();


 let path = `users/${user.uid}`;
 

    const dataUrl = (await this.utilSvc.takePicture('Imagen del Perfil'))
      .dataUrl;

       const loading = await this.utilSvc.loading();
    await loading.present();

       let imagePath = `${user.uid}/profile`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, dataUrl);


    this.firebaseSvc
      .updateDocument(path, {image:user.image})
      .then(async (res) => {
        
        this.utilSvc.saveInLocalStorage('user',user);

        this.utilSvc.presentToast({
          message: 'Imagen Actualizada Exitosamente',
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
