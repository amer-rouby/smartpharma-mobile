import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponse } from '../models/product.model';

export type PagedFetcher<T> = (page: number, size: number, search: string) => Observable<PagedResponse<T>>;

/**
 * Shared state + loading logic for an Ionic infinite-scroll list, with
 * optional debounced search. One instance per list page - construct with a
 * fetcher that maps (page, size, search) to a paged response; components
 * that don't search can ignore the search argument, and components whose
 * search endpoint can't paginate (e.g. sales-history) can cap the returned
 * totalPages to stop further loadMore calls without any extra API here.
 */
export class PagedList<T> {
  readonly items = signal<T[]>([]);
  readonly loading = signal(true);
  readonly hasMore = signal(true);
  readonly searchTerm = signal('');

  private page = 0;
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly fetch: PagedFetcher<T>,
    private readonly pageSize = 20
  ) {}

  load(reset: boolean, event?: CustomEvent): void {
    if (reset) {
      this.page = 0;
      this.loading.set(true);
    }
    this.fetch(this.page, this.pageSize, this.searchTerm().trim()).subscribe({
      next: (result) => {
        this.items.set(reset ? result.content : [...this.items(), ...result.content]);
        this.hasMore.set(this.page + 1 < result.totalPages);
        this.loading.set(false);
        this.completeEvent(event);
      },
      error: () => {
        this.loading.set(false);
        this.completeEvent(event);
      },
    });
  }

  loadMore(event: CustomEvent): void {
    if (!this.hasMore()) {
      this.completeEvent(event);
      return;
    }
    this.page += 1;
    this.load(false, event);
  }

  onSearchChange(value: string, debounceMs = 400): void {
    this.searchTerm.set(value);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => this.load(true), debounceMs);
  }

  private completeEvent(event?: CustomEvent): void {
    (event?.target as HTMLIonInfiniteScrollElement | undefined)?.complete();
  }
}
