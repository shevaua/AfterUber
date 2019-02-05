import { Component } from '@angular/core';
import { ApiGetPriceService } from './api-get-price.service';
import { FormControl, Validators, EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private inProgress = false;

  private from = new FormControl('', [ 
    Validators.required,
    Validators.minLength(3),
  ]);

  private to = new FormControl('', [ 
    Validators.required,
    Validators.minLength(3),
  ]);

  constructor(
    private priceApi: ApiGetPriceService
  ) { 
    this.from.setValue('1452 56th Street, Brooklyn, NY 11219');
    this.to.setValue('704 E 2nd St, Brooklyn, NY 11218');
  }

  submit()
  {
    if(
      !this.from.valid
      || !this.to.valid
    ) {
      return;
    }

    this.inProgress = true;

    this.priceApi.getPrice(this.from.value, this.to.value)
      .subscribe(
        (response) => { 
          this.inProgress = false;
          console.log(response); }, 
        (response) => { 
          this.inProgress = false;
          console.log(response); 
        },
      );
  }

}
