/** red mana as terminal text, e.g. "6r". */
export function ManaCount({ count }: { count: number }) {
  return (
    <b className="mana" title={`____ Goblin adds ${count} red mana`}>
      {count}
      <i>r</i>
    </b>
  );
}
