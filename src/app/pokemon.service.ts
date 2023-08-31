import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  iif,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Pokemon, PokemonsResponse } from './models/response.model';
import { PokemonDetails } from './models/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  readonly #http = inject(HttpClient);

  readonly pokemons = signal<Pokemon[]>([]);
  readonly loading = signal(false);
  readonly searchQuery = signal<string | null>(null);
  readonly searchResults = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(600),
      distinctUntilChanged(),
      map((query) =>
        query !== null
          ? this.pokemons().filter((pokemon) => pokemon.name.includes(query.toLowerCase()))
          : this.pokemons()
      )
    ),
    { initialValue: [] as Pokemon[] }
  );

  // without RxJS interop:
  // no debounceTime, distinctUntilChanged :(
  //
  // computed(() => {
  //   const query = this.searchQuery();
  //   return query !== null ?  this.pokemons().filter((pokemon) =>
  //     pokemon.name.includes(query)
  //   ) : [];
  // });

  constructor() {
    this.#loadAll()
      .pipe(takeUntilDestroyed())
      .subscribe((pokemons) => this.pokemons.set(pokemons));
  }

  #loadAll() {
    this.loading.set(true);
    return this.#loadPokemons().pipe(
      map((responses) => responses.flatMap((response) => response.results)),
      tap(() => this.loading.set(false))
    );
  }

  #loadPokemons(
    responses: PokemonsResponse[] = [],
    url = 'https://pokeapi.co/api/v2/pokemon',
    maxCalls = 50
  ): Observable<PokemonsResponse[]> {
    return this.#http
      .get<PokemonsResponse>(url)
      .pipe(
        switchMap((response) =>
          iif(
            () => response.next !== null && maxCalls > 0,
            this.#loadPokemons(
              [...responses, response],
              response.next as string,
              maxCalls - 1
            ),
            of(responses.concat(response) as PokemonsResponse[])
          )
        )
      );
  }

  loadPokemon(url: string) {
    return this.#http.get<PokemonDetails>(url);
  }
}
