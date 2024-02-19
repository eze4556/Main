import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  //servicios
  firebaseSvc = inject(FirebaseService);
  utilSvc = inject(UtilsService);

  // constructor(private firebaseSvc: FirebaseService) {}

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilSvc.loading();
      await loading.present();

      this.firebaseSvc
        .sendRecoveryEmail(this.form.value.email)
        .then((res) => {
         

          this.utilSvc.presentToast({
            message: 'Corre enviado con exito',
            duration: 1500,
            color: 'primary',
            position: 'middle',
            icon: 'mail-outline',
          });
         
          this.utilSvc.routerLink('/auth')
          this.form.reset();

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
