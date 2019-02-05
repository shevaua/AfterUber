import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiGetPriceService {

  private url = '/api/v1/price';

  constructor(
    private http: HttpClient
  ) { }

  getPrice(from, to): Observable<any> 
  {

    return this.http.get(this.url, {
      params: {
        from: from,
        to: to,
      }
    });
    
  }

}
