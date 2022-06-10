import { Component, Input, OnInit } from '@angular/core';
import { QueryClient } from 'react-query/core';
import { QueryObserver } from 'react-query/lib/core';

@Component({
  selector: 'hello',
  template: `<h1>Hello {{name}}!</h1>`,
  styles: [`h1 { font-family: Lato; }`],
})
export class HelloComponent implements OnInit {
  @Input() name: string;

  ngOnInit() {
    const queryClient = new QueryClient();
    // create query options
    const defaultedOptions = queryClient.defaultQueryOptions({
      queryKey: ['test'],
      queryFn: () => {
        return 'hihi';
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
  }
}
