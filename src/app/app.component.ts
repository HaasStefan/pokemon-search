import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonCardComponent } from './pokemon-card.component';
import { PokemonService } from './pokemon.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PokemonCardComponent],
  selector: 'app-root',
  template: `
    <h1
      class="text-4xl text-center p-6 shadow-2xl mb-10 font-medium bg-black text-white"
    >
      Pokemon Search
    </h1>

    <div
      *ngIf="loading(); else loaded"
      class="flex justify-center p-8 text-neutral-300"
    >
      <span class="text-5xl">
        <i class="fa-solid fa-spinner animate-spin"></i>
      </span>
    </div>

    <ng-template #loaded>
      <div class="w-full flex flex-col items-center gap-8 p-8">
        <div class="px-36 w-full">
          <input
            type="text"
            placeholder="Search for a pokemon"
            class="bg-neutral-600 border border-gray-300 text-neutral-300 text-sm rounded-lg block w-full p-2.5 "
            [ngModel]="searchQuery()"
            (ngModelChange)="search($event)"
          />
        </div>

        <div
          class="grid grid-cols-2 mt-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-8"
        >
          <ng-container *ngFor="let pokemon of pokemons()">
            <app-pokemon-card [pokemon]="pokemon" />
          </ng-container>
        </div>
      </div>
    </ng-template>

    <footer
      class="fixed bottom-0 w-full z-10 p-3 bg-neutral-900 text-neutral-300"
    >
      <a href="https://ng-journal.com" class=" flex justify-center items-center gap-2">
        <img
          src="https://ng-journal.com/assets/ng-journal.png"
          class="w-10 h-10"
        />
        <span>NG Journal</span>
      </a>
    </footer>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly pokemonService = inject(PokemonService);

  readonly pokemons = this.pokemonService.searchResults;
  readonly loading = this.pokemonService.loading;
  readonly searchQuery = this.pokemonService.searchQuery;

  search(query: string) {
    this.pokemonService.searchQuery.set(query);
  }
}
