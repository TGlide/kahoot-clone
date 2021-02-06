export function twoWayBind(state: string, setter: (val: any) => void) {
  return {
    value: state,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string
    ) => setter(typeof e === "string" ? e : e.target.value),
  };
}
