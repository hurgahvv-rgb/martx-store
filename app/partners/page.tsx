import { InfoPage } from "@/components/info-page";

export default function PartnersPage() {
  return (
    <InfoPage
      eyebrow="Хамтын ажиллагаа"
      title="Брэнд, уран бүтээлч, байгууллагуудтай хамтарна"
      description="MartX нь premium өдөр тутмын хэрэглээний бүтээгдэхүүн, limited collection, corporate gift багцууд дээр хамтрах боломжтой."
      sections={[
        {
          title: "Брэнд хамтын ажиллагаа",
          body: "Өөрийн бүтээгдэхүүнээ MartX catalog-д байршуулах, хамтарсан collection гаргах саналыг нээлттэй хүлээн авна."
        },
        {
          title: "Corporate gift",
          body: "Байгууллагын бэлэг, ажилтны welcome kit, event gift багцыг тоо ширхэг болон төсөвт тохируулан санал болгоно."
        },
        {
          title: "Контент ба influencer",
          body: "Бүтээгдэхүүний зураг авалт, review, social campaign дээр тохирсон creator-уудтай хамтрах сонирхолтой."
        }
      ]}
    />
  );
}
