import { Component, Input, OnInit } from '@angular/core';
import { QueryClient, QueryObserver, QueryKey } from 'react-query/core';
import { UseQueryOptions, UseQueryResult } from 'react-query/lib/reactjs/types';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'hello',
  template: `<h1>Hello {{queryResult.data}}!</h1>`,
  styles: [`h1 { font-family: Lato; }`],
})
export class HelloComponent implements OnInit {
  @Input() name: string;

  queryResult = null;

  ngOnInit() {
    const queryResult$ = useQuery({});
    queryResult$.subscribe((data) => {
      console.log('queryResult----', data);
      this.queryResult = data;
    });
  }
}
// singleton for entire app
const queryClient = new QueryClient();

function useQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): any {
  const result$ = new Subject<any>();
  // create query options
  const defaultedOptions = queryClient.defaultQueryOptions({
    queryKey: ['test'],
    queryFn: () => {
      return Promise.resolve('hihi');
    },
    onSuccess: (data) => {
      console.log('onSuccess', data);
    },
    onError: () => {
      console.log('onError');
    },
  });

  // create new observer for the current query
  const observer = new QueryObserver(queryClient, defaultedOptions);
  observer
    .fetchOptimistic(defaultedOptions)
    .then(({ data }) => {
      defaultedOptions.onSuccess?.(data as any);
      defaultedOptions.onSettled?.(data, null);
    })
    .catch((error) => {
      defaultedOptions.onError?.(error);
      defaultedOptions.onSettled?.(undefined, error);
    });

  const result = observer.getOptimisticResult(defaultedOptions);
  result$.next(result);

  observer.subscribe((data) => {
    result$.next(data);
  });

  return result$;
}
