import type { GlobalWordViewModel } from 'lib/words/types';
import { PronunciationControls } from 'components/pronunciation/pronunciation-controls';

export function WordDetailContent({ word }: { word: GlobalWordViewModel }) {
  const entry = word.content.word;
  const body = entry.content;
  const translations = body.trans?.filter(
    (item) => item.tranCn?.trim() || item.tranOther?.trim(),
  );
  const sentences = body.sentence?.sentences?.filter(
    (item) => item.sContent?.trim() || item.sCn?.trim(),
  );
  const phrases = body.phrase?.phrases?.filter(
    (item) => item.pContent?.trim() || item.pCn?.trim(),
  );
  const synonyms = body.syno?.synos?.filter(
    (item) => item.tran?.trim() || item.hwds?.some((word) => word.w?.trim()),
  );
  const relatedWords = body.relWord?.rels?.filter((item) => item.words?.length);

  return (
    <div className="space-y-4 px-5 pb-[calc(40px+env(safe-area-inset-bottom))]">
      <section className="relative overflow-hidden rounded-[32px] bg-forest px-6 py-9 text-white shadow-feature">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[22px] border-white/[0.04]" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sun">Word detail</p>
        <h1 className="mt-2 break-words font-serif text-[44px] font-black leading-tight tracking-tight">
          {entry.wordHead}
        </h1>
        <div className="mt-5 flex justify-start">
          <PronunciationControls
            headword={entry.wordHead}
            ukphone={body.ukphone}
            usphone={body.usphone}
            variant="inverse"
          />
        </div>
      </section>

      <DetailSection eyebrow="Meaning" title="释义" accent="sun">
        {translations?.length ? (
          <div className="space-y-5">
            {translations.map((translation, index) => (
              <div key={`${translation.tranCn}-${index}`}>
                {translation.tranCn && (
                  <p className="text-lg font-black leading-7 text-ink">{translation.tranCn}</p>
                )}
                {translation.tranOther && (
                  <p className="mt-1.5 font-serif text-sm leading-6 text-ink/50">
                    {translation.tranOther}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/40">暂无释义</p>
        )}
      </DetailSection>

      {sentences && sentences.length > 0 && (
        <DetailSection eyebrow="Examples" title="例句" accent="mint">
          <ol className="space-y-5">
            {sentences.map((sentence, index) => (
              <li key={`${sentence.sContent}-${index}`} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint text-[10px] font-black text-forest">
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  {sentence.sContent && (
                    <p className="break-words font-serif text-[16px] font-bold leading-6 text-ink">
                      {sentence.sContent}
                    </p>
                  )}
                  {sentence.sCn && (
                    <p className="mt-1 text-sm leading-6 text-ink/45">{sentence.sCn}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </DetailSection>
      )}

      {phrases && phrases.length > 0 && (
        <DetailSection eyebrow="Phrases" title="常用短语" accent="coral">
          <div className="divide-y divide-ink/[0.06]">
            {phrases.map((phrase, index) => (
              <div
                key={`${phrase.pContent}-${index}`}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 py-3 first:pt-0 last:pb-0"
              >
                <p className="break-words font-serif text-sm font-bold text-ink">
                  {phrase.pContent}
                </p>
                <p className="text-right text-sm text-ink/45">{phrase.pCn}</p>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {body.remMethod?.val?.trim() && (
        <DetailSection eyebrow="Memory" title="记忆方法" accent="sun">
          <blockquote className="rounded-2xl bg-sun/15 px-4 py-4 text-sm font-medium leading-7 text-ink/65">
            “{body.remMethod.val.trim()}”
          </blockquote>
        </DetailSection>
      )}

      {synonyms && synonyms.length > 0 && (
        <DetailSection eyebrow="Similar" title="同近词" accent="mint">
          <div className="space-y-4">
            {synonyms.map((group, index) => (
              <div key={`${group.pos}-${index}`}>
                <div className="flex items-start gap-2">
                  {group.pos && (
                    <span className="rounded-full bg-forest px-2 py-1 text-[10px] font-bold text-white">
                      {group.pos}
                    </span>
                  )}
                  {group.tran && <p className="text-sm leading-6 text-ink/55">{group.tran}</p>}
                </div>
                {group.hwds && group.hwds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.hwds.map((item) =>
                      item.w ? (
                        <span
                          key={item.w}
                          className="rounded-full border border-forest/10 bg-mint/60 px-3 py-1.5 font-serif text-xs font-bold text-forest"
                        >
                          {item.w}
                        </span>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {relatedWords && relatedWords.length > 0 && (
        <DetailSection eyebrow="Word family" title="同根词" accent="coral">
          <div className="space-y-5">
            {relatedWords.map((group, index) => (
              <div key={`${group.pos}-${index}`}>
                {group.pos && (
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-coral-dark">
                    {group.pos}
                  </p>
                )}
                <div className="space-y-2">
                  {group.words?.map((related, wordIndex) => (
                    <div
                      key={`${related.hwd}-${wordIndex}`}
                      className="flex items-baseline justify-between gap-4 rounded-xl bg-paper px-3.5 py-3"
                    >
                      <span className="font-serif text-sm font-black text-ink">
                        {related.hwd}
                      </span>
                      <span className="text-right text-xs leading-5 text-ink/45">
                        {related.tran}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

function DetailSection({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: 'sun' | 'mint' | 'coral';
  children: React.ReactNode;
}) {
  const accentClass = {
    sun: 'bg-sun',
    mint: 'bg-mint-strong',
    coral: 'bg-coral',
  }[accent];

  return (
    <section className="rounded-[26px] bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center gap-3">
        <span className={`h-8 w-1.5 rounded-full ${accentClass}`} />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink/30">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 text-base font-black text-ink">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
