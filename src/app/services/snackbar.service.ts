import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackbar: MatSnackBar) { }

  public showError(message: string) {
    this.snackbar.open(message, undefined, {
      duration: 5000
    });
  }
}
