import { Subscribe } from './subcribe';

// Example 1: Basic usage with all callbacks
console.log('=== Example 1: Full Observer ===');
const observable1 = new Subscribe<number>();

const subscription1 = observable1.subscribe({
    next: (value) => console.log('Received:', value),
    error: (err) => console.error('Error:', err),
    complete: () => console.log('Completed!')
});

observable1.next(1);
observable1.next(2);
observable1.next(3);
observable1.complete();

// Example 2: Simple usage with just next callback
console.log('\n=== Example 2: Simple Next Function ===');
const observable2 = new Subscribe<string>();

const subscription2 = observable2.subscribe((value) => {
    console.log('Got message:', value);
});

observable2.next('Hello');
observable2.next('World');

// Unsubscribe to stop receiving updates
subscription2.unsubscribe();

observable2.next('This will not be logged');

// Example 3: Multiple subscribers
console.log('\n=== Example 3: Multiple Subscribers ===');
const observable3 = new Subscribe<{ event: string; data: any }>();

const sub1 = observable3.subscribe({
    next: (value) => console.log('Subscriber 1:', value.event, value.data)
});

const sub2 = observable3.subscribe({
    next: (value) => console.log('Subscriber 2:', value.event, value.data)
});

observable3.next({ event: 'user_login', data: { userId: 123 } });
observable3.next({ event: 'user_logout', data: { userId: 123 } });

sub1.unsubscribe();

observable3.next({ event: 'page_view', data: { page: '/home' } }); // Only sub2 will see this

// Example 4: Error handling
console.log('\n=== Example 4: Error Handling ===');
const observable4 = new Subscribe<number>();

observable4.subscribe({
    next: (value) => console.log('Value:', value),
    error: (err) => console.error('Caught error:', err.message),
    complete: () => console.log('Done!')
});

observable4.next(10);
observable4.error(new Error('Something went wrong'));
observable4.next(20); // Still works after error
observable4.complete();

