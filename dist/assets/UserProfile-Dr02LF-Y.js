import{_ as K,r as y,B as M,C as D,z as H,c as o,a as n,t as e,h as i,l as _,D as q,n as v,E as w,o as l,A as s,G as b}from"./index-DeMDEMsO.js";const Q={class:"user-profile-page container"},S={key:0,class:"loading-state"},G={key:1,class:"error-state"},F={key:2,class:"profile-layout"},U={class:"profile-sidebar"},$={class:"profile-card user-info-card"},z={class:"profile-ctn"},E={class:"username"},R={class:"email"},A={class:"overview-section"},O={class:"info-grid"},Y={class:"info-item profile-ctn"},j={class:"info-value font-semibold"},J={class:"info-item"},W={class:"info-value discount-value"},X={key:0,class:"freeship-tag"},Z={class:"loyalty-content"},nn={class:"profile-card vip-card"},tn={class:"vip-card-header"},sn={class:"vip-level"},en={class:"current-level-text"},on={key:0,class:"progress-section"},ln={class:"progress-header"},an={class:"progress-title"},cn={class:"progress-percentage"},rn={class:"progress-bar-container"},hn={class:"progress-remaining-text"},un={class:"font-semibold"},dn={key:1,class:"permanent-vip-message"},pn={key:0,class:"profile-card maintenance-card"},vn={class:"maintenance-info"},gn={class:"info-item"},mn={class:"info-value"},fn={class:"info-item"},yn={class:"info-value text-red-500 font-bold"},_n={class:"profile-card rules-accordion"},bn={key:0,class:"rules-content"},Vn=["innerHTML"],Tn=`
Chào mừng bạn đến với Chương Trình Khách Hàng Thân Thiết!
Tại đây, mọi chi tiêu của bạn đều được tích lũy để mở khóa những đặc quyền mua sắm hấp dẫn.

### 1. Các Cấp Bậc VIP & Quyền Lợi
Hành trình của bạn sẽ đi qua 4 cấp bậc, mỗi cấp độ sẽ mang lại một mức chiết khấu vĩnh viễn trên mọi đơn hàng.

* **VIP 1**
    * **Đạt được khi:** Tổng chi tiêu tích lũy đạt 1 triệu VNĐ
    * **Quyền lợi:** Giảm 2% trên mọi đơn hàng

* **VIP 2**
    * **Đạt được khi:** Tổng chi tiêu tích lũy đạt 2,5 triệu VNĐ
    * **Quyền lợi:** Giảm 3% trên mọi đơn hàng, freeship

* **VIP 3**
    * **Đạt được khi:** Tổng chi tiêu tích lũy đạt 5 triệu VNĐ
    * **Quyền lợi:** Giảm 5% trên mọi đơn hàng, freeship

* **VIP 4 (Vĩnh Viễn)**
    * **Đạt được khi:** Tổng chi tiêu tích lũy đạt 8 triệu VNĐ
    * **Quyền lợi:** Giảm 7% trên mọi đơn hàng trọn đời và không cần duy trì!, freeship

---

### 2. Quy Tắc Duy Trì Cấp Bậc
Để đảm bảo bạn luôn nhận được những ưu đãi tốt nhất, các cấp bậc VIP 1, 2 và 3 có một quy tắc duy trì đơn giản:

* **Thời hạn duy trì:** Kể từ khi bạn đạt một cấp VIP mới, bạn sẽ có 3 tháng để duy trì cấp bậc đó.

* **Yêu cầu duy trì:** Trong vòng 3 tháng này, bạn chỉ cần chi tiêu một khoản tiền bằng 30% giá trị ban đầu của cấp bậc đó. Khi bạn hoàn thành yêu cầu này, cấp bậc của bạn sẽ được duy trì thêm 3 tháng nữa.

    * *Ví dụ:* Khi bạn đạt VIP 1 (với 1 triệu VNĐ), bạn chỉ cần chi tiêu thêm 300.000 VNĐ trong 3 tháng để duy trì cấp VIP 1.
    * Khi bạn đạt VIP 2 (với 2.5 triệu VNĐ), bạn chỉ cần chi tiêu thêm 750.000 VNĐ trong 3 tháng để duy trì cấp VIP 2.

* **Thăng hạng tự động:** Nếu trong 3 tháng này, bạn chi tiêu đủ số tiền của cấp tiếp theo, bạn sẽ được thăng hạng ngay lập tức và chu kỳ 3 tháng mới sẽ bắt đầu.

* **Hạ cấp:** Nếu không đạt đủ yêu cầu duy trì, bạn sẽ trở về cấp bậc trước đó.

---

### 3. Bắt đầu ngay hôm nay!
Mọi chi tiêu của bạn đều được tự động ghi nhận. Hãy mua sắm ngay bây giờ để bắt đầu hành trình tích điểm, thăng hạng và tận hưởng những ưu đãi đặc biệt chỉ dành cho bạn!
`,Ln={__name:"UserProfile",setup(kn){const V=y(!0),g=y(""),h=y(!1),m={1:1e6,2:25e5,3:5e6,4:8e6},T=M(()=>{if(!s.value||s.value.vipLevel>=4)return 100;const a=s.value.vipLevel,t=a+1,c=s.value.totalSpent;if(a===0){const p=m[t];return Math.min(100,c/p*100)}const r=m[a],u=m[t]-r,d=c-r;return Math.min(100,d/u*100)}),B=M(()=>{var t;return((t=s.value)==null?void 0:t.vipLevel)>=2});return D(async()=>{try{await H()}catch(a){console.error("Failed to fetch user info:",a),g.value="Không thể tải thông tin người dùng. Vui lòng thử lại."}finally{V.value=!1}}),(a,t)=>{var c,r,f,u,d,p,L,k,x,P,I,C,N;return l(),o("div",Q,[V.value?(l(),o("div",S,t[1]||(t[1]=[n("i",{class:"fa-solid fa-spinner animate-spin text-4xl text-primary-color"},null,-1)]))):g.value?(l(),o("div",G,e(g.value),1)):(l(),o("div",F,[n("aside",U,[n("div",$,[n("div",z,[t[2]||(t[2]=n("i",{class:"fa-solid fa-circle-user profile-icon"},null,-1)),n("div",null,[n("h1",E,e((c=i(s))==null?void 0:c.username),1),n("p",R,e((r=i(s))==null?void 0:r.email),1)])]),t[7]||(t[7]=n("div",{class:"divider"},null,-1)),n("div",A,[t[6]||(t[6]=n("h2",{class:"section-title"},"Tổng quan",-1)),n("div",O,[n("div",Y,[t[3]||(t[3]=n("span",{class:"info-label"},"Tổng chi tiêu",-1)),n("span",j,e(i(b)((f=i(s))==null?void 0:f.totalSpent)),1)]),n("div",J,[t[4]||(t[4]=n("span",{class:"info-label"},"Mức giảm giá",-1)),n("span",W,e((((u=i(s))==null?void 0:u.discountPercentage)*100).toFixed(0))+"%",1)]),B.value?(l(),o("div",X,t[5]||(t[5]=[n("i",{class:"fa-solid fa-truck"},null,-1),n("span",null,"Freeship",-1)]))):_("",!0)])])])]),n("main",Z,[t[16]||(t[16]=n("h2",{class:"page-title"},"Chương Trình Khách Hàng Thân Thiết",-1)),n("div",nn,[n("div",tn,[n("div",sn,[t[8]||(t[8]=n("i",{class:"fa-solid fa-crown"},null,-1)),n("span",null,"VIP "+e((d=i(s))==null?void 0:d.vipLevel),1)]),n("p",en,e(((p=i(s))==null?void 0:p.vipLevel)===4?"Cấp bậc Vĩnh Viễn":"Cấp bậc hiện tại"),1)]),((L=i(s))==null?void 0:L.vipLevel)<4?(l(),o("div",on,[n("div",ln,[n("span",an,"Lên VIP "+e(((k=i(s))==null?void 0:k.vipLevel)+1),1),n("span",cn,e(Math.round(T.value))+"%",1)]),n("div",rn,[n("div",{class:"progress-bar",style:q({width:T.value+"%"})},null,4)]),n("p",hn,[t[9]||(t[9]=v(" Chi tiêu thêm ")),n("span",un,e(i(b)((x=i(s))==null?void 0:x.nextLevelRequirement)),1),t[10]||(t[10]=v(" để thăng hạng. "))])])):(l(),o("div",dn,t[11]||(t[11]=[n("p",null,"Bạn đã đạt cấp bậc cao nhất. Cảm ơn bạn đã đồng hành cùng TUNI TOKU!",-1)])))]),((P=i(s))==null?void 0:P.vipLevel)>0&&((I=i(s))==null?void 0:I.vipLevel)<4?(l(),o("div",pn,[t[14]||(t[14]=n("h3",{class:"section-title"},"Duy trì cấp bậc",-1)),n("div",vn,[n("div",gn,[t[12]||(t[12]=n("span",{class:"info-label"},[n("i",{class:"fa-solid fa-clock"}),v(" Ngày hết hạn")],-1)),n("span",mn,e(new Date((C=i(s))==null?void 0:C.vipExpiryDate).toLocaleDateString()),1)]),n("div",fn,[t[13]||(t[13]=n("span",{class:"info-label"},[n("i",{class:"fa-solid fa-bullseye"}),v(" Cần chi tiêu")],-1)),n("span",yn,e(i(b)((N=i(s))==null?void 0:N.maintenanceRequirement)),1)])])])):_("",!0),n("div",_n,[n("button",{onClick:t[0]||(t[0]=xn=>h.value=!h.value),class:"accordion-button"},[t[15]||(t[15]=n("h3",{class:"section-title"},"Thể lệ chương trình",-1)),n("i",{class:w(["fa-solid fa-chevron-down",{"rotate-180":h.value}])},null,2)]),h.value?(l(),o("div",bn,[n("div",{class:"program-text pre-line-text",innerHTML:Tn.replace(/### (.*)/g,"<h3>$1</h3>").replace(/\* \*\*(.*)\*\*/g,"<li><strong>$1</strong></li>").replace(/\* (.*)/g,"<li>$1</li>")},null,8,Vn)])):_("",!0)])])]))])}}},In=K(Ln,[["__scopeId","data-v-84d24bb3"]]);export{In as default};
