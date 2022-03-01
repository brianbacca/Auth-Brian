import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const initSwagger = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Api')
    .addBasicAuth()
    .addBearerAuth()
    .setDescription('AuthApi can be used in any project')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, document),
    {
      explorer: true,
      swaggerOptions: {
        filter: true,
        showRequestDuration: true,
      },
    };
};
