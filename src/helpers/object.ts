export function joinObjects<T>(target: T, source: Partial<T>): T {
  Object.keys(source).forEach((key) => {
    if(key.startsWith('_')) {
      return;
    }
    if(!target[key as keyof T]) {
      target[key as keyof T] = source[key as keyof T] as T[keyof T];
      return;
    }
    joinObjects(target[key as keyof T] as any, source[key as keyof T] as any);
  });
  return target;
}