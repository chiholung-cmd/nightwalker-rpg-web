export default function HomePage() {
  return (
    <main style={{
      background: '#090909',
      color: '#f5f5f5',
      minHeight: '100vh',
      padding: '16px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto'
      }}>

        <div style={{
          border: '1px solid #2a2a2a',
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          background: '#111'
        }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
            夜行者 NIGHTWALKER
          </div>
          <div style={{ opacity: 0.7, marginTop: '4px' }}>
            AI Horror Text RPG
          </div>
        </div>

        <div style={{
          border: '1px solid #2a2a2a',
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '16px',
          background: '#111'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            【林夜】
          </div>

          <div>HP：84 / 100</div>
          <div>SAN：61 / 100</div>
          <div>STA：73 / 100</div>
          <div>污染值：18%</div>
          <div>稱號：仍然選擇活下去的人</div>
        </div>

        <div style={{
          border: '1px solid #2a2a2a',
          padding: '16px',
          borderRadius: '12px',
          lineHeight: 1.8,
          background: '#111',
          marginBottom: '16px'
        }}>
          <div style={{
            color: '#9ca3af',
            marginBottom: '12px'
          }}>
            深夜 02:14｜夜巡局醫療層
          </div>

          <p>
            病房內所有鏡子正在滲血。
          </p>

          <p>
            葉晴站在病床旁，身後的鏡子裡，另一個『她』正慢慢露出笑容。
          </p>

          <p>
            周成握緊制靈刀。
          </p>

          <p>
            而你發現。
          </p>

          <p>
            病房的門——
          </p>

          <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
            不知道甚麼時候已經消失了。
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>

          <button style={buttonStyle}>
            A｜衝向葉晴
            <br />
            STA -15｜受傷風險：高
          </button>

          <button style={buttonStyle}>
            B｜觀察鏡中規則
            <br />
            SAN -8｜污染風險：中
          </button>

          <button style={buttonStyle}>
            C｜拔出制靈槍
            <br />
            消耗：1發制靈彈
          </button>

          <button style={buttonStyle}>
            D｜自由輸入行動
            <br />
            AI動態生成
          </button>

        </div>
      </div>
    </main>
  )
}

const buttonStyle = {
  background: '#18181b',
  color: '#f5f5f5',
  border: '1px solid #27272a',
  padding: '14px',
  borderRadius: '12px',
  textAlign: 'left' as const,
  lineHeight: 1.6,
  fontSize: '14px'
}
