# EquityFlow

EquityFlow, girişimler, merkeziyetsiz otonom organizasyonlar (DAO) ve ekipler için geliştirilmiş, tamamen blockchain üzerinde çalışan **merkeziyetsiz bir öz sermaye (equity) ve iş yönetim platformudur.** 

Ekip üyelerinin yaptıkları işleri şeffaf bir şekilde kaydetmelerini, diğer üyelerin onayıyla hisse (token) kazanmalarını ve elde edilen gelirin hisse oranında otomatik dağıtılmasını sağlar.

## 🚀 Temel Özellikler

- **Şeffaf İş Akışı:** Ekip üyeleri yaptıkları işleri (saat bazında) sisteme girer. Diğer paydaşların %51 onayından geçen işler otomatik olarak tamamlanmış sayılır.
- **Otomatik Hisse (Token) Dağıtımı:** Onaylanan her iş için sisteme baştan belirlenmiş oranlarda **EQT Token** basılır ve işi yapan kişinin cüzdanına gönderilir.
- **Adil Temettü (Gelir) Dağıtımı:** Projeye giren gelirler (ETH), akıllı kontratta toplanır ve tek bir tıkla paydaşlara ellerindeki EQT token (hisse) oranında adil şekilde dağıtılır.
- **NFT Tabanlı Dijital Kimlikler:** Her paydaşın rolü, sisteme giriş yaptığı cüzdana tanımlanmış bir NFT (ContributorNFT) ile güvence altına alınır. Paydaşlar geçmiş tüm emeklerini ve haklarını bu NFT üzerinde kalıcı olarak saklayabilir; ayrıca projeden ayrılmak veya haklarını devretmek istediklerinde bu NFT'yi bir başkasına transfer edebilirler.

## 🛠 Teknik Altyapı

Proje, modern Web3 teknolojileri ve akıllı kontrat standartları kullanılarak inşa edilmiştir:

- **Ağ:** Ethereum Sepolia Testnet
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons
- **Web3 Entegrasyonu:** ethers.js (v6)
- **Akıllı Kontrat Dili:** Solidity (^0.8.20)
- **Kontrat Standartları:** OpenZeppelin (ERC20, ERC721, AccessControl, Ownable)

## 📜 Akıllı Kontratlar

EquityFlow sistemi, birbirine entegre çalışan 5 temel akıllı kontrattan oluşur:

1. **ContributorNFT.sol:** Ekip üyelerine atanmış kimlik tokenidir. Üyenin rolünü, sisteme katkı sağladığı toplam saati ve geçmiş emeklerini kayıt altında tutar. Hakların devredilebilmesi için transfer edilebilir yapıdadır ve yetkilendirme (izin) mekanizmasının temelini oluşturur.
2. **EquityToken.sol (EQT):** Projenin öz sermayesini temsil eden ERC20 tokenidir. İşler onaylandıkça otomatik olarak basılır (mint) ve sahiplerine oy/temettü gücü verir.
3. **MainEngine.sol:** Sistemin kalbidir. İş girişlerini, %51 onay eşiği mantığını ve iş onaylandığında EQT tokenin basılması sürecini yönetir.
4. **DividendDistributor.sol:** Gelir paylaşımını yönetir. Projenin kasasına gelen ETH'leri, o anki EQT token sahiplerine ellerindeki hisse oranında böler ve çekilebilir (claim) hale getirir.
5. **GovernanceVoting.sol:** Proje içi kararların alındığı modüldür. 30 günlük süre içinde sunulan önergelerin %51 oranla kabulünü veya reddini blockchain üzerine değişmez bir şekilde kaydeder.

## 💻 Kurulum ve Çalıştırma

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

### Gereksinimler
- Node.js (v18+)
- MetaMask eklentisi (Tarayıcıda kurulu ve Sepolia ağına ayarlanmış olmalı)
- Biraz Testnet ETH (Sepolia Faucet'lerinden temin edilebilir)

### Adımlar

1. **Projeyi indirin ve bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **Tarayıcıda açın:**
   Uygulama `http://localhost:5173` adresinde çalışmaya başlayacaktır. MetaMask üzerinden bağlanarak sistemi test edebilirsiniz.

   > **💡 Önemli Not (Test Edenler İçin):** Sistemi deploy eden ilk cüzdan (Admin) benim tarafımdan yönetilmektedir. Uygulamanın özelliklerini (iş ekleme, oylama yapma vb.) test edebilmeniz için öncelikle Admin tarafından projeye **"Paydaş" (Contributor)** olarak eklenmeniz gerekmektedir. Sisteme yetkisiz cüzdanlarla bağlandığınızda yalnızca kısıtlı bir ekranla karşılaşırsınız.

## 🔐 Güvenlik ve Yetkilendirme (Admin)
Sistemi ilk kuran cüzdan (Deployer), otomatik olarak **Kurucu (Admin)** yetkilerine sahip olur. 
- Admin, "Profilim" sekmesindeki özel bir panel üzerinden ekibe yeni üyeler dahil edebilir.


---
*EquityFlow, blockchain dünyasında ekiplerin birbirine güven duymadan (trustless) tam şeffaflıkla çalışabilmesi için tasarlanmıştır.*
