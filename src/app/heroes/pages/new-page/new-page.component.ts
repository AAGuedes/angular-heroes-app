import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { switchMap } from 'rxjs';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl<string>(''),
    first_appearance: new FormControl<string>(''),
    characters: new FormControl<string>(''),
    alt_img: new FormControl<string>('')
  });

  public publishers = [
    { id: 'DC Comics', value: 'DC - Comics'},
    { id: 'Marvel Comics', value: 'Marvel - Comics'}
  ]

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) {}


  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if(!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap(({id}) => this.heroesService.getHeroById(id))
      ).subscribe(hero => {
        if(!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      })
  }

  onSubmit(): void {
    if(this.heroForm.invalid) return;

    if(this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero)
        .subscribe(hero => {
          this.showSnackbar(`${hero.superhero} actualizado!`);
        })
      return;
    }

    this.heroesService.addHero(this.currentHero)
      .subscribe(hero => {
        this.showSnackbar(`${hero.superhero} creado!`);
        this.router.navigate(['/heroes/edit/', hero.id]);
      })
  }

  onDeleteHero() {
    if(!this.currentHero.id) throw Error('Hero ID is required');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;
      this.showSnackbar(`${this.heroForm.value.superhero} borrado!`);
      this.router.navigate(['/heroes/list']);
      this.heroesService.deleteHeroById(this.currentHero.id);
    });
  }

  showSnackbar(message: string): void {
    this.snackbar.open(message, '', {
      duration: 2500
    })
  }

}
